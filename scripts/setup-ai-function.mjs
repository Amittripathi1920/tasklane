import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env");
const functionDir = path.join(cwd, "appwrite", "functions", "ai-router");
const packagePath = path.join(cwd, "appwrite", "functions", "ai-router.tar.gz");
const resourcesPath = path.join(cwd, "tables", "appwrite.resources.json");
const FUNCTION_ID = "tasklane_ai_router";

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
  const cleanUri =
    base.endsWith("/v1") && uri.startsWith("/v1") ? uri.replace(/^\/v1/, "") : uri;
  const url = `${base}${cleanUri}`;
  const res = await fetch(url, {
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
    const err = new Error(`${data.message || `Appwrite API error ${res.status}`} [${method} ${uri}]`);
    err.status = res.status;
    throw err;
  }
  return data;
}

async function appwriteMultipart({ endpoint, projectId, apiKey, method, uri, formData }) {
  const base = (endpoint || "").replace(/\/+$/, "");
  const cleanUri =
    base.endsWith("/v1") && uri.startsWith("/v1") ? uri.replace(/^\/v1/, "") : uri;
  const url = `${base}${cleanUri}`;
  const res = await fetch(url, {
    method,
    headers: {
      "x-appwrite-project": projectId,
      "x-appwrite-key": apiKey,
    },
    body: formData,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(`${data.message || `Appwrite API error ${res.status}`} [${method} ${uri}]`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function packageFunctionSource() {
  if (fs.existsSync(packagePath)) fs.unlinkSync(packagePath);
  execSync(`tar -czf "${packagePath}" -C "${functionDir}" .`, { stdio: "inherit" });
  if (!fs.existsSync(packagePath)) throw new Error("Failed to create function package.");
}

function updateEnvFunctionId(functionId) {
  if (!fs.existsSync(envPath)) return;
  let raw = fs.readFileSync(envPath, "utf8");
  if (/^VITE_APPWRITE_AI_FUNCTION_ID=/m.test(raw)) {
    raw = raw.replace(/^VITE_APPWRITE_AI_FUNCTION_ID=.*$/m, `VITE_APPWRITE_AI_FUNCTION_ID=${functionId}`);
  } else {
    raw += `\nVITE_APPWRITE_AI_FUNCTION_ID=${functionId}\n`;
  }
  fs.writeFileSync(envPath, raw, "utf8");
}

function updateResourcesArtifact(functionId) {
  if (!fs.existsSync(resourcesPath)) return;
  try {
    const current = JSON.parse(fs.readFileSync(resourcesPath, "utf8"));
    current.aiFunctionId = functionId;
    current.generatedAt = new Date().toISOString();
    fs.writeFileSync(resourcesPath, JSON.stringify(current, null, 2), "utf8");
  } catch {
    // Keep setup resilient if the artifact is missing or malformed.
  }
}

async function ensureFunction(config) {
  const { endpoint, projectId, apiKey } = config;
  try {
    await appwriteJSON({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/functions/${FUNCTION_ID}`,
    });
    return;
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  let runtime = "node-22";
  try {
    const runtimes = await appwriteJSON({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: "/v1/functions/runtimes",
    });
    const nodeRuntime = (runtimes.runtimes || []).find((r) => String(r.key || "").startsWith("node-"));
    if (nodeRuntime?.key) runtime = nodeRuntime.key;
  } catch {
    // Use default runtime fallback.
  }

  await appwriteJSON({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: "/v1/functions",
    body: {
      functionId: FUNCTION_ID,
      name: "Tasklane AI Router",
      runtime,
      execute: ["any"],
      timeout: 15,
    },
  });
}

async function upsertVariable(config, key, value) {
  const { endpoint, projectId, apiKey } = config;
  let existing = null;
  try {
    const vars = await appwriteJSON({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/functions/${FUNCTION_ID}/variables`,
    });
    existing = (vars.variables || []).find((v) => v.key === key) || null;
    if (existing) {
      try {
        await appwriteJSON({
          endpoint,
          projectId,
          apiKey,
          method: "PUT",
          uri: `/v1/functions/${FUNCTION_ID}/variables/${existing.$id}`,
          body: { key, value },
        });
        return;
      } catch (err) {
        if (!String(err.message || "").includes("Route not found")) throw err;
        await appwriteJSON({
          endpoint,
          projectId,
          apiKey,
          method: "PATCH",
          uri: `/v1/functions/${FUNCTION_ID}/variables/${existing.$id}`,
          body: { key, value },
        });
        return;
      }
    }
  } catch {
    // Fall through to create.
  }

  await appwriteJSON({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/functions/${FUNCTION_ID}/variables`,
    body: { key, value },
  });
}

async function createDeployment(config) {
  const { endpoint, projectId, apiKey } = config;
  const packageBlob = await fs.openAsBlob(packagePath);
  const form = new FormData();
  form.append("entrypoint", "src/main.js");
  form.append("activate", "true");
  form.append("code", packageBlob, "function.tar.gz");

  await appwriteMultipart({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/functions/${FUNCTION_ID}/deployments`,
    formData: form,
  });
}

async function main() {
  const env = getEnv();
  const endpoint = env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = env.VITE_APPWRITE_PROJECT_ID;
  const apiKey = env.APPWRITE_API_KEY;
  const groqApiKey = env.VITE_GROQ_API_KEY;
  const groqModel = env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!projectId || !endpoint) {
    throw new Error("Missing VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID in .env");
  }
  if (!apiKey) {
    throw new Error("Missing APPWRITE_API_KEY in .env");
  }
  if (!groqApiKey) {
    throw new Error("Missing VITE_GROQ_API_KEY in .env");
  }

  const config = { endpoint, projectId, apiKey };

  await ensureFunction(config);
  await upsertVariable(config, "GROQ_API_KEY", groqApiKey);
  await upsertVariable(config, "GROQ_MODEL", groqModel);
  packageFunctionSource();
  await createDeployment(config);
  updateEnvFunctionId(FUNCTION_ID);
  updateResourcesArtifact(FUNCTION_ID);

  console.log("AI function ready.");
  console.log(`Function ID: ${FUNCTION_ID}`);
  console.log("Updated .env with VITE_APPWRITE_AI_FUNCTION_ID.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
