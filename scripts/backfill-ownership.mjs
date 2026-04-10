import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env");

function parseEnvFile(raw) {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return out;
}

function getEnv() {
  const fileEnv = fs.existsSync(envPath) ? parseEnvFile(fs.readFileSync(envPath, "utf8")) : {};
  return { ...fileEnv, ...process.env };
}

async function appwriteJSON({ endpoint, projectId, apiKey, method, uri, body }) {
  const base = (endpoint || "").replace(/\/+$/, "");
  const cleanUri = base.endsWith("/v1") && uri.startsWith("/v1") ? uri.replace(/^\/v1/, "") : uri;
  const res = await fetch(`${base}${cleanUri}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-appwrite-project": projectId,
      "x-appwrite-key": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data.message || `Appwrite API error ${res.status} [${method} ${uri}]`);
  }
  return data;
}

async function listDocuments(config, collectionId) {
  return appwriteJSON({
    ...config,
    method: "GET",
    uri: `/v1/databases/${config.databaseId}/collections/${collectionId}/documents`,
  });
}

async function updateDocument(config, collectionId, documentId, data) {
  return appwriteJSON({
    ...config,
    method: "PATCH",
    uri: `/v1/databases/${config.databaseId}/collections/${collectionId}/documents/${documentId}`,
    body: { data },
  });
}

async function main() {
  const env = getEnv();
  const config = {
    endpoint: env.VITE_APPWRITE_ENDPOINT,
    projectId: env.VITE_APPWRITE_PROJECT_ID,
    databaseId: env.VITE_APPWRITE_DATABASE_ID,
    apiKey: env.APPWRITE_API_KEY,
  };

  if (!config.endpoint || !config.projectId || !config.databaseId || !config.apiKey) {
    throw new Error("Missing Appwrite environment variables.");
  }

  const usersCollectionId = env.VITE_APPWRITE_USERS_COLLECTION_ID || "tasklane_users";
  const collections = [
    env.VITE_APPWRITE_TASKS_COLLECTION_ID,
    env.VITE_APPWRITE_PROJECTS_COLLECTION_ID,
    env.VITE_APPWRITE_SPRINTS_COLLECTION_ID,
    env.VITE_APPWRITE_COMMENTS_COLLECTION_ID,
    env.VITE_APPWRITE_SUBTASKS_COLLECTION_ID,
    env.VITE_APPWRITE_AUDIT_COLLECTION_ID,
  ].filter(Boolean);

  const users = await listDocuments(config, usersCollectionId);
  const owner = (users.documents || []).find((user) => user.isActive !== false);
  if (!owner) throw new Error("No active user found for ownership backfill.");

  const stats = {};
  for (const collectionId of collections) {
    const response = await listDocuments(config, collectionId);
    let updated = 0;
    for (const doc of response.documents || []) {
      const next = {};
      if (!doc.createdByUserId) next.createdByUserId = owner.$id;
      if (!doc.updatedByUserId) next.updatedByUserId = owner.$id;
      if (Object.keys(next).length === 0) continue;
      await updateDocument(config, collectionId, doc.$id, next);
      updated += 1;
    }
    stats[collectionId] = { total: (response.documents || []).length, updated };
  }

  console.log(
    JSON.stringify(
      {
        owner: { id: owner.$id, name: owner.name, email: owner.email },
        stats,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
