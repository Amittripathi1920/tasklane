import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(rootDir, ".env");

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
}

const env = { ...readEnvFile(envPath), ...process.env };

const endpoint = env.VITE_APPWRITE_ENDPOINT;
const projectId = env.VITE_APPWRITE_PROJECT_ID;
const databaseId = env.VITE_APPWRITE_DATABASE_ID;
const collectionId = env.VITE_APPWRITE_TASKS_COLLECTION_ID || "tasklane_tasks";
const apiKey = env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !databaseId || !apiKey) {
  throw new Error("Missing Appwrite config in .env for task minutes backfill.");
}

const baseHeaders = {
  "X-Appwrite-Project": projectId,
  "X-Appwrite-Key": apiKey,
  "Content-Type": "application/json",
};

function hoursToMinutes(value) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  const hours = Number(value);
  if (!Number.isFinite(hours)) return null;
  return Math.max(0, Math.round(hours * 60));
}

async function api(pathname, init = {}) {
  const response = await fetch(`${endpoint}${pathname}`, {
    ...init,
    headers: {
      ...baseHeaders,
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || text || `Request failed: ${response.status}`);
  }
  return data;
}

async function listAllDocuments() {
  const response = await api(`/databases/${databaseId}/collections/${collectionId}/documents`);
  return response.documents || [];
}

async function updateDocument(documentId, payload) {
  return api(`/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: payload }),
  });
}

async function main() {
  const tasks = await listAllDocuments();
  let updated = 0;

  for (const task of tasks) {
    const nextEstimateMinutes =
      task.estimateMinutes ?? hoursToMinutes(task.estimateHours) ?? 0;
    const nextActualMinutes =
      task.actualMinutes ?? hoursToMinutes(task.actualHours);

    const needsEstimateUpdate = task.estimateMinutes !== nextEstimateMinutes;
    const needsActualUpdate = task.actualMinutes !== nextActualMinutes;

    if (!needsEstimateUpdate && !needsActualUpdate) continue;

    await updateDocument(task.$id, {
      estimateMinutes: nextEstimateMinutes,
      actualMinutes: nextActualMinutes,
      updatedAt: task.updatedAt || new Date().toISOString(),
    });
    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        collectionId,
        checked: tasks.length,
        updated,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
