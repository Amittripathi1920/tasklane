import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env");
const tablesDir = path.join(cwd, "tables");
const resourcesPath = path.join(tablesDir, "appwrite.resources.json");
const schemaPath = path.join(tablesDir, "tasklane_tasks.collection.json");
const commentsSchemaPath = path.join(tablesDir, "tasklane_comments.collection.json");
const subtasksSchemaPath = path.join(tablesDir, "tasklane_subtasks.collection.json");
const projectsSchemaPath = path.join(tablesDir, "tasklane_projects.collection.json");
const projectMembersSchemaPath = path.join(tablesDir, "tasklane_project_members.collection.json");
const sprintsSchemaPath = path.join(tablesDir, "tasklane_sprints.collection.json");
const auditSchemaPath = path.join(tablesDir, "tasklane_audit.collection.json");
const feedbackSchemaPath = path.join(tablesDir, "tasklane_feedback.collection.json");
const notesSchemaPath = path.join(tablesDir, "tasklane_notes.collection.json");
const usersSchemaPath = path.join(tablesDir, "tasklane_users.collection.json");
const sessionsSchemaPath = path.join(tablesDir, "tasklane_sessions.collection.json");

const TASKS_COLLECTION_ID = "tasklane_tasks";
const COMMENTS_COLLECTION_ID = "tasklane_comments";
const SUBTASKS_COLLECTION_ID = "tasklane_subtasks";
const PROJECTS_COLLECTION_ID = "tasklane_projects";
const PROJECT_MEMBERS_COLLECTION_ID = "tasklane_project_members";
const SPRINTS_COLLECTION_ID = "tasklane_sprints";
const AUDIT_COLLECTION_ID = "tasklane_audit";
const FEEDBACK_COLLECTION_ID = "tasklane_feedback";
const NOTES_COLLECTION_ID = "tasklane_notes";
const USERS_COLLECTION_ID = "tasklane_users";
const SESSIONS_COLLECTION_ID = "tasklane_sessions";

function parseEnvFile(raw) {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

function getEnv() {
  const fileEnv = fs.existsSync(envPath) ? parseEnvFile(fs.readFileSync(envPath, "utf8")) : {};
  return { ...fileEnv, ...process.env };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function appwriteRequest({ endpoint, projectId, apiKey, method, uri, body }) {
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

const OPEN_COLLECTION_PERMISSIONS = ['read("any")', 'create("any")', 'update("any")', 'delete("any")'];

async function updateCollectionPermissions(config, collectionId, name) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "PUT",
    uri: `/v1/databases/${databaseId}/collections/${collectionId}`,
    body: {
      name,
      documentSecurity: false,
      permissions: OPEN_COLLECTION_PERMISSIONS,
      enabled: true,
    },
  });
}

async function ensureCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${TASKS_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: TASKS_COLLECTION_ID,
      name: "Tasklane Tasks",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureCommentsCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${COMMENTS_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: COMMENTS_COLLECTION_ID,
      name: "Tasklane Comments",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureSubtasksCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${SUBTASKS_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: SUBTASKS_COLLECTION_ID,
      name: "Tasklane Subtasks",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureProjectsCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${PROJECTS_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: PROJECTS_COLLECTION_ID,
      name: "Tasklane Projects",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureProjectMembersCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${PROJECT_MEMBERS_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: PROJECT_MEMBERS_COLLECTION_ID,
      name: "Tasklane Project Members",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureSprintsCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${SPRINTS_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: SPRINTS_COLLECTION_ID,
      name: "Tasklane Sprints",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureAuditCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${AUDIT_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: AUDIT_COLLECTION_ID,
      name: "Tasklane Audit",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureFeedbackCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${FEEDBACK_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: FEEDBACK_COLLECTION_ID,
      name: "Tasklane Feedback",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureNotesCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${NOTES_COLLECTION_ID}`,
    });
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: NOTES_COLLECTION_ID,
      name: "Tasklane Notes",
      documentSecurity: false,
      permissions: ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureUsersCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${USERS_COLLECTION_ID}`,
    });
    await updateCollectionPermissions(config, USERS_COLLECTION_ID, "Tasklane Users");
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: USERS_COLLECTION_ID,
      name: "Tasklane Users",
      documentSecurity: false,
      permissions: OPEN_COLLECTION_PERMISSIONS,
      enabled: true,
    },
  });
  return { created: true };
}

async function ensureSessionsCollection(config) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "GET",
      uri: `/v1/databases/${databaseId}/collections/${SESSIONS_COLLECTION_ID}`,
    });
    await updateCollectionPermissions(config, SESSIONS_COLLECTION_ID, "Tasklane Sessions");
    return { created: false };
  } catch (err) {
    if (err.status !== 404) throw err;
  }

  await appwriteRequest({
    endpoint,
    projectId,
    apiKey,
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections`,
    body: {
      collectionId: SESSIONS_COLLECTION_ID,
      name: "Tasklane Sessions",
      documentSecurity: false,
      permissions: OPEN_COLLECTION_PERMISSIONS,
      enabled: true,
    },
  });
  return { created: true };
}

async function safeCreateAttribute(config, key, payload) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  const collectionId = payload.collectionId || TASKS_COLLECTION_ID;
  const body = { ...payload };
  delete body.collectionId;
  try {
    await appwriteRequest({
      endpoint,
      projectId,
      apiKey,
      method: "POST",
      uri: `/v1/databases/${databaseId}/collections/${collectionId}/attributes/${key}`,
      body,
    });
  } catch (err) {
    const text = String(err.message || "");
    if (
      err.status === 409 ||
      text.includes("already exists") ||
      text.includes("Duplicate") ||
      text.toLowerCase().includes("maximum number") ||
      text.toLowerCase().includes("max number") ||
      text.includes("attribute with same key")
    ) {
      return;
    }
    throw err;
  }
}

async function safeCreateIndex(config, key, payload) {
  const { endpoint, projectId, apiKey, databaseId } = config;
  const collectionId = payload.collectionId || TASKS_COLLECTION_ID;
  const body = { ...payload };
  delete body.collectionId;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await appwriteRequest({
        endpoint,
        projectId,
        apiKey,
        method: "POST",
        uri: `/v1/databases/${databaseId}/collections/${collectionId}/indexes`,
        body: {
          key,
          ...body,
        },
      });
      return;
    } catch (err) {
      const text = String(err.message || "");
      if (err.status === 409 || text.includes("already exists")) return;
      if (text.includes("not yet available") && attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }
      throw err;
    }
  }
}

function writeSchemaArtifacts(databaseId) {
  ensureDir(tablesDir);
  const schema = {
    databaseId,
    collectionId: TASKS_COLLECTION_ID,
    name: "Tasklane Tasks",
    attributes: [
      { key: "taskNo", type: "string", size: 32, required: false },
      { key: "projectId", type: "string", size: 64, required: false },
      { key: "sprintId", type: "string", size: 64, required: false },
      { key: "assignedToUserId", type: "string", size: 64, required: false },
      { key: "assignedToName", type: "string", size: 255, required: false },
      { key: "title", type: "string", size: 255, required: true },
      { key: "description", type: "string", size: 10000, required: false },
      { key: "status", type: "string", size: 64, required: true },
      { key: "priority", type: "string", size: 32, required: true },
      { key: "labels", type: "string", size: 64, required: false, array: true },
      { key: "dueDate", type: "string", size: 32, required: false },
      { key: "estimateHours", type: "integer", min: 0, max: 10000, required: true },
      { key: "estimateMinutes", type: "integer", min: 0, max: 600000, required: false },
      { key: "actualHours", type: "integer", min: 0, max: 10000, required: false },
      { key: "actualMinutes", type: "integer", min: 0, max: 600000, required: false },
      { key: "isActive", type: "boolean", required: false },
      { key: "recurringEnabled", type: "boolean", required: false },
      { key: "recurringFrequency", type: "string", size: 32, required: false },
      { key: "recurringInterval", type: "integer", min: 1, max: 365, required: false },
      { key: "lastRecurringAt", type: "string", size: 64, required: false },
      { key: "sourceTaskId", type: "string", size: 64, required: false },
      { key: "createdByUserId", type: "string", size: 64, required: false },
      { key: "updatedByUserId", type: "string", size: 64, required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "updatedAt", type: "string", size: 64, required: true },
      { key: "completedAt", type: "string", size: 64, required: false },
    ],
    indexes: [
      { key: "idx_status", type: "key", attributes: ["status"] },
      { key: "idx_projectId", type: "key", attributes: ["projectId"] },
      { key: "idx_sprintId", type: "key", attributes: ["sprintId"] },
      { key: "idx_assignedToUserId", type: "key", attributes: ["assignedToUserId"] },
      { key: "idx_isActive", type: "key", attributes: ["isActive"] },
      { key: "idx_dueDate", type: "key", attributes: ["dueDate"] },
      { key: "idx_updatedAt", type: "key", attributes: ["updatedAt"] },
    ],
  };

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2), "utf8");
  const commentsSchema = {
    databaseId,
    collectionId: COMMENTS_COLLECTION_ID,
    name: "Tasklane Comments",
    attributes: [
      { key: "taskId", type: "string", size: 64, required: true },
      { key: "commentText", type: "string", size: 10000, required: true },
      { key: "createdBy", type: "string", size: 128, required: false },
      { key: "createdByUserId", type: "string", size: 64, required: false },
      { key: "updatedByUserId", type: "string", size: 64, required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "isActive", type: "boolean", required: false },
      { key: "imageUrl", type: "string", size: 1024, required: false },
    ],
    indexes: [
      { key: "idx_taskId", type: "key", attributes: ["taskId"] },
      { key: "idx_createdAt", type: "key", attributes: ["createdAt"] },
    ],
  };
  fs.writeFileSync(commentsSchemaPath, JSON.stringify(commentsSchema, null, 2), "utf8");
  const subtasksSchema = {
    databaseId,
    collectionId: SUBTASKS_COLLECTION_ID,
    name: "Tasklane Subtasks",
    attributes: [
      { key: "taskId", type: "string", size: 64, required: true },
      { key: "title", type: "string", size: 512, required: true },
      { key: "status", type: "string", size: 32, required: true },
      { key: "createdBy", type: "string", size: 128, required: false },
      { key: "createdByUserId", type: "string", size: 64, required: false },
      { key: "updatedByUserId", type: "string", size: 64, required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "isActive", type: "boolean", required: false },
    ],
    indexes: [{ key: "idx_taskId", type: "key", attributes: ["taskId"] }],
  };
  fs.writeFileSync(subtasksSchemaPath, JSON.stringify(subtasksSchema, null, 2), "utf8");
  const projectsSchema = {
    databaseId,
    collectionId: PROJECTS_COLLECTION_ID,
    name: "Tasklane Projects",
    attributes: [
      { key: "name", type: "string", size: 255, required: true },
      { key: "description", type: "string", size: 4000, required: false },
      { key: "color", type: "string", size: 32, required: false },
      { key: "icon", type: "string", size: 64, required: false },
      { key: "isActive", type: "boolean", required: false },
      { key: "createdByUserId", type: "string", size: 64, required: false },
      { key: "updatedByUserId", type: "string", size: 64, required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "updatedAt", type: "string", size: 64, required: true },
    ],
    indexes: [
      { key: "idx_isActive", type: "key", attributes: ["isActive"] },
      { key: "idx_updatedAt", type: "key", attributes: ["updatedAt"] },
    ],
  };
  fs.writeFileSync(projectsSchemaPath, JSON.stringify(projectsSchema, null, 2), "utf8");
  const projectMembersSchema = {
    databaseId,
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
    name: "Tasklane Project Members",
    attributes: [
      { key: "projectId", type: "string", size: 64, required: true },
      { key: "userId", type: "string", size: 64, required: true },
      { key: "role", type: "string", size: 32, required: true },
      { key: "addedBy", type: "string", size: 255, required: false },
      { key: "isActive", type: "boolean", required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "updatedAt", type: "string", size: 64, required: true },
    ],
    indexes: [
      { key: "idx_projectId", type: "key", attributes: ["projectId"] },
      { key: "idx_userId", type: "key", attributes: ["userId"] },
      { key: "idx_role", type: "key", attributes: ["role"] },
      { key: "idx_isActive", type: "key", attributes: ["isActive"] },
    ],
  };
  fs.writeFileSync(projectMembersSchemaPath, JSON.stringify(projectMembersSchema, null, 2), "utf8");
  const sprintsSchema = {
    databaseId,
    collectionId: SPRINTS_COLLECTION_ID,
    name: "Tasklane Sprints",
    attributes: [
      { key: "projectId", type: "string", size: 64, required: true },
      { key: "name", type: "string", size: 255, required: true },
      { key: "goal", type: "string", size: 4000, required: false },
      { key: "status", type: "string", size: 32, required: true },
      { key: "startDate", type: "string", size: 64, required: false },
      { key: "endDate", type: "string", size: 64, required: false },
      { key: "closedAt", type: "string", size: 64, required: false },
      { key: "committedTaskIds", type: "string", size: 64, required: false, array: true },
      { key: "createdByUserId", type: "string", size: 64, required: false },
      { key: "updatedByUserId", type: "string", size: 64, required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "updatedAt", type: "string", size: 64, required: true },
    ],
    indexes: [
      { key: "idx_projectId", type: "key", attributes: ["projectId"] },
      { key: "idx_status", type: "key", attributes: ["status"] },
      { key: "idx_updatedAt", type: "key", attributes: ["updatedAt"] },
    ],
  };
  fs.writeFileSync(sprintsSchemaPath, JSON.stringify(sprintsSchema, null, 2), "utf8");
  const auditSchema = {
    databaseId,
    collectionId: AUDIT_COLLECTION_ID,
    name: "Tasklane Audit",
    attributes: [
      { key: "taskId", type: "string", size: 64, required: false },
      { key: "projectId", type: "string", size: 64, required: false },
      { key: "entityType", type: "string", size: 32, required: true },
      { key: "actionType", type: "string", size: 64, required: true },
      { key: "message", type: "string", size: 4000, required: true },
      { key: "meta", type: "string", size: 10000, required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "createdBy", type: "string", size: 128, required: false },
      { key: "createdByUserId", type: "string", size: 64, required: false },
      { key: "updatedByUserId", type: "string", size: 64, required: false },
    ],
    indexes: [
      { key: "idx_taskId", type: "key", attributes: ["taskId"] },
      { key: "idx_projectId", type: "key", attributes: ["projectId"] },
      { key: "idx_createdAt", type: "key", attributes: ["createdAt"] },
      { key: "idx_actionType", type: "key", attributes: ["actionType"] },
    ],
  };
  fs.writeFileSync(auditSchemaPath, JSON.stringify(auditSchema, null, 2), "utf8");
  const feedbackSchema = {
    databaseId,
    collectionId: FEEDBACK_COLLECTION_ID,
    name: "Tasklane Feedback",
    attributes: [
      { key: "userId", type: "string", size: 64, required: true },
      { key: "userName", type: "string", size: 255, required: true },
      { key: "userEmail", type: "string", size: 255, required: true },
      { key: "type", type: "string", size: 32, required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "message", type: "string", size: 10000, required: true },
      { key: "status", type: "string", size: 32, required: true },
      { key: "isActive", type: "boolean", required: false },
      { key: "createdByUserId", type: "string", size: 64, required: false },
      { key: "updatedByUserId", type: "string", size: 64, required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "updatedAt", type: "string", size: 64, required: true },
    ],
    indexes: [
      { key: "idx_userId", type: "key", attributes: ["userId"] },
      { key: "idx_type", type: "key", attributes: ["type"] },
      { key: "idx_status", type: "key", attributes: ["status"] },
      { key: "idx_isActive", type: "key", attributes: ["isActive"] },
      { key: "idx_createdAt", type: "key", attributes: ["createdAt"] },
    ],
  };
  fs.writeFileSync(feedbackSchemaPath, JSON.stringify(feedbackSchema, null, 2), "utf8");
  const notesSchema = {
    databaseId,
    collectionId: NOTES_COLLECTION_ID,
    name: "Tasklane Notes",
    attributes: [
      { key: "type", type: "string", size: 32, required: true },
      { key: "title", type: "string", size: 255, required: true },
      { key: "content", type: "string", size: 50000, required: false },
      { key: "userId", type: "string", size: 64, required: false },
      { key: "userName", type: "string", size: 255, required: false },
      { key: "projectId", type: "string", size: 64, required: false },
      { key: "isActive", type: "boolean", required: false },
      { key: "createdByUserId", type: "string", size: 64, required: false },
      { key: "updatedByUserId", type: "string", size: 64, required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "updatedAt", type: "string", size: 64, required: true },
    ],
    indexes: [
      { key: "idx_type", type: "key", attributes: ["type"] },
      { key: "idx_userId", type: "key", attributes: ["userId"] },
      { key: "idx_projectId", type: "key", attributes: ["projectId"] },
      { key: "idx_isActive", type: "key", attributes: ["isActive"] },
      { key: "idx_updatedAt", type: "key", attributes: ["updatedAt"] },
    ],
  };
  fs.writeFileSync(notesSchemaPath, JSON.stringify(notesSchema, null, 2), "utf8");
  const usersSchema = {
    databaseId,
    collectionId: USERS_COLLECTION_ID,
    name: "Tasklane Users",
    attributes: [
      { key: "name", type: "string", size: 255, required: true },
      { key: "email", type: "string", size: 255, required: true },
      { key: "passwordHash", type: "string", size: 255, required: true },
      { key: "gender", type: "string", size: 16, required: false },
      { key: "role", type: "string", size: 32, required: true },
      { key: "isActive", type: "boolean", required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
      { key: "updatedAt", type: "string", size: 64, required: true },
    ],
    indexes: [
      { key: "idx_email", type: "unique", attributes: ["email"] },
      { key: "idx_isActive", type: "key", attributes: ["isActive"] },
    ],
  };
  fs.writeFileSync(usersSchemaPath, JSON.stringify(usersSchema, null, 2), "utf8");
  const sessionsSchema = {
    databaseId,
    collectionId: SESSIONS_COLLECTION_ID,
    name: "Tasklane Sessions",
    attributes: [
      { key: "userId", type: "string", size: 64, required: true },
      { key: "tokenHash", type: "string", size: 128, required: true },
      { key: "expiresAt", type: "string", size: 64, required: true },
      { key: "isActive", type: "boolean", required: false },
      { key: "createdAt", type: "string", size: 64, required: true },
    ],
    indexes: [
      { key: "idx_userId", type: "key", attributes: ["userId"] },
      { key: "idx_tokenHash", type: "unique", attributes: ["tokenHash"] },
      { key: "idx_expiresAt", type: "key", attributes: ["expiresAt"] },
    ],
  };
  fs.writeFileSync(sessionsSchemaPath, JSON.stringify(sessionsSchema, null, 2), "utf8");
  const resources = {
    databaseId,
    tasksCollectionId: TASKS_COLLECTION_ID,
    commentsCollectionId: COMMENTS_COLLECTION_ID,
    subtasksCollectionId: SUBTASKS_COLLECTION_ID,
    projectsCollectionId: PROJECTS_COLLECTION_ID,
    projectMembersCollectionId: PROJECT_MEMBERS_COLLECTION_ID,
    sprintsCollectionId: SPRINTS_COLLECTION_ID,
    auditCollectionId: AUDIT_COLLECTION_ID,
    feedbackCollectionId: FEEDBACK_COLLECTION_ID,
    notesCollectionId: NOTES_COLLECTION_ID,
    usersCollectionId: USERS_COLLECTION_ID,
    sessionsCollectionId: SESSIONS_COLLECTION_ID,
    aiFunctionId: "set_after_function_deploy",
    authFunctionId: "set_after_auth_function_deploy",
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(resourcesPath, JSON.stringify(resources, null, 2), "utf8");
}

function syncEnvFile() {
  if (!fs.existsSync(envPath)) return;
  let envRaw = fs.readFileSync(envPath, "utf8");
  if (!/^VITE_APPWRITE_TASKS_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_TASKS_COLLECTION_ID=${TASKS_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_PROJECTS_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_PROJECTS_COLLECTION_ID=${PROJECTS_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_PROJECT_MEMBERS_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_PROJECT_MEMBERS_COLLECTION_ID=${PROJECT_MEMBERS_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_SUBTASKS_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_SUBTASKS_COLLECTION_ID=${SUBTASKS_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_SPRINTS_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_SPRINTS_COLLECTION_ID=${SPRINTS_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_AUDIT_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_AUDIT_COLLECTION_ID=${AUDIT_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_FEEDBACK_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_FEEDBACK_COLLECTION_ID=${FEEDBACK_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_NOTES_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_NOTES_COLLECTION_ID=${NOTES_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_USERS_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_USERS_COLLECTION_ID=${USERS_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_SESSIONS_COLLECTION_ID=/m.test(envRaw)) {
    envRaw += `\nVITE_APPWRITE_SESSIONS_COLLECTION_ID=${SESSIONS_COLLECTION_ID}\n`;
  }
  if (!/^VITE_APPWRITE_AI_FUNCTION_ID=/m.test(envRaw)) {
    envRaw += "VITE_APPWRITE_AI_FUNCTION_ID=\n";
  }
  if (!/^VITE_APPWRITE_AUTH_FUNCTION_ID=/m.test(envRaw)) {
    envRaw += "VITE_APPWRITE_AUTH_FUNCTION_ID=\n";
  }
  fs.writeFileSync(envPath, envRaw, "utf8");
}

async function main() {
  const env = getEnv();
  const endpoint = env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = env.VITE_APPWRITE_PROJECT_ID;
  const databaseId = env.VITE_APPWRITE_DATABASE_ID;
  const apiKey = env.APPWRITE_API_KEY;

  if (!projectId || !databaseId) {
    throw new Error("Missing VITE_APPWRITE_PROJECT_ID or VITE_APPWRITE_DATABASE_ID in .env.");
  }
  if (!apiKey) {
    throw new Error("Missing APPWRITE_API_KEY. Add it to .env or run with APPWRITE_API_KEY=<key>.");
  }

  const config = { endpoint, projectId, databaseId, apiKey };

  await ensureCollection(config);
  await ensureCommentsCollection(config);
  await ensureSubtasksCollection(config);
  await ensureProjectsCollection(config);
  await ensureProjectMembersCollection(config);
  await ensureSprintsCollection(config);
  await ensureAuditCollection(config);
  await ensureFeedbackCollection(config);
  await ensureNotesCollection(config);
  await ensureUsersCollection(config);
  await ensureSessionsCollection(config);

  await safeCreateAttribute(config, "string", {
    key: "taskNo",
    size: 32,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "projectId",
    size: 64,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "sprintId",
    size: 64,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "assignedToUserId",
    size: 64,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "assignedToName",
    size: 255,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "title",
    size: 255,
    required: true,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "description",
    size: 10000,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "status",
    size: 64,
    required: true,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "priority",
    size: 32,
    required: true,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "labels",
    size: 64,
    required: false,
    default: null,
    array: true,
  });
  await safeCreateAttribute(config, "string", {
    key: "dueDate",
    size: 32,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "integer", {
    key: "estimateHours",
    required: true,
    min: 0,
    max: 10000,
    array: false,
  });
  await safeCreateAttribute(config, "integer", {
    key: "estimateMinutes",
    required: false,
    min: 0,
    max: 600000,
    array: false,
  });
  await safeCreateAttribute(config, "integer", {
    key: "actualHours",
    required: false,
    min: 0,
    max: 10000,
    array: false,
  });
  await safeCreateAttribute(config, "integer", {
    key: "actualMinutes",
    required: false,
    min: 0,
    max: 600000,
    array: false,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    default: true,
    array: false,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "recurringEnabled",
    required: false,
    default: false,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "recurringFrequency",
    size: 32,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "integer", {
    key: "recurringInterval",
    required: false,
    min: 1,
    max: 365,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "lastRecurringAt",
    size: 64,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "sourceTaskId",
    size: 64,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdByUserId",
    size: 64,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedByUserId",
    size: 64,
    required: false,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedAt",
    size: 64,
    required: true,
    default: null,
    array: false,
  });
  await safeCreateAttribute(config, "string", {
    key: "completedAt",
    size: 64,
    required: false,
    default: null,
    array: false,
  });

  await safeCreateIndex(config, "idx_status", { type: "key", attributes: ["status"] });
  await safeCreateIndex(config, "idx_projectId", { type: "key", attributes: ["projectId"] });
  await safeCreateIndex(config, "idx_sprintId", { type: "key", attributes: ["sprintId"] });
  await safeCreateIndex(config, "idx_assignedToUserId", { type: "key", attributes: ["assignedToUserId"] });
  await safeCreateIndex(config, "idx_isActive", { type: "key", attributes: ["isActive"] });
  await safeCreateIndex(config, "idx_dueDate", { type: "key", attributes: ["dueDate"] });
  await safeCreateIndex(config, "idx_updatedAt", { type: "key", attributes: ["updatedAt"] });

  // Comments collection attributes
  await safeCreateAttribute(config, "string", {
    key: "taskId",
    size: 64,
    required: true,
    array: false,
    collectionId: COMMENTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "commentText",
    size: 10000,
    required: true,
    array: false,
    collectionId: COMMENTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdBy",
    size: 128,
    required: false,
    array: false,
    collectionId: COMMENTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: COMMENTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: COMMENTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: COMMENTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    default: true,
    array: false,
    collectionId: COMMENTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "imageUrl",
    size: 1024,
    required: false,
    array: false,
    collectionId: COMMENTS_COLLECTION_ID,
  });

  await safeCreateIndex(config, "idx_taskId", {
    type: "key",
    attributes: ["taskId"],
    collectionId: COMMENTS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_createdAt", {
    type: "key",
    attributes: ["createdAt"],
    collectionId: COMMENTS_COLLECTION_ID,
  });

  // Subtasks collection attributes
  await safeCreateAttribute(config, "string", {
    key: "taskId",
    size: 64,
    required: true,
    array: false,
    collectionId: SUBTASKS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "title",
    size: 512,
    required: true,
    array: false,
    collectionId: SUBTASKS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "status",
    size: 32,
    required: true,
    array: false,
    collectionId: SUBTASKS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdBy",
    size: 128,
    required: false,
    array: false,
    collectionId: SUBTASKS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: SUBTASKS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: SUBTASKS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: SUBTASKS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    array: false,
    collectionId: SUBTASKS_COLLECTION_ID,
  });

  await safeCreateIndex(config, "idx_taskId", {
    type: "key",
    attributes: ["taskId"],
    collectionId: SUBTASKS_COLLECTION_ID,
  });

  // Projects collection attributes
  await safeCreateAttribute(config, "string", {
    key: "name",
    size: 255,
    required: true,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "description",
    size: 4000,
    required: false,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "color",
    size: 32,
    required: false,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "icon",
    size: 64,
    required: false,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    default: true,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedAt",
    size: 64,
    required: true,
    array: false,
    collectionId: PROJECTS_COLLECTION_ID,
  });

  await safeCreateIndex(config, "idx_isActive", {
    type: "key",
    attributes: ["isActive"],
    collectionId: PROJECTS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_updatedAt", {
    type: "key",
    attributes: ["updatedAt"],
    collectionId: PROJECTS_COLLECTION_ID,
  });

  // Project members collection attributes
  await safeCreateAttribute(config, "string", {
    key: "projectId",
    size: 64,
    required: true,
    array: false,
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "userId",
    size: 64,
    required: true,
    array: false,
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "role",
    size: 32,
    required: true,
    array: false,
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "addedBy",
    size: 255,
    required: false,
    array: false,
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    default: true,
    array: false,
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedAt",
    size: 64,
    required: true,
    array: false,
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });

  await safeCreateIndex(config, "idx_projectId", {
    type: "key",
    attributes: ["projectId"],
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_userId", {
    type: "key",
    attributes: ["userId"],
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_role", {
    type: "key",
    attributes: ["role"],
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_isActive", {
    type: "key",
    attributes: ["isActive"],
    collectionId: PROJECT_MEMBERS_COLLECTION_ID,
  });

  // Sprints collection attributes
  await safeCreateAttribute(config, "string", {
    key: "projectId",
    size: 64,
    required: true,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "name",
    size: 255,
    required: true,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "goal",
    size: 4000,
    required: false,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "status",
    size: 32,
    required: true,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "startDate",
    size: 64,
    required: false,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "endDate",
    size: 64,
    required: false,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "closedAt",
    size: 64,
    required: false,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "committedTaskIds",
    size: 64,
    required: false,
    array: true,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedAt",
    size: 64,
    required: true,
    array: false,
    collectionId: SPRINTS_COLLECTION_ID,
  });

  await safeCreateIndex(config, "idx_projectId", {
    type: "key",
    attributes: ["projectId"],
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_status", {
    type: "key",
    attributes: ["status"],
    collectionId: SPRINTS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_updatedAt", {
    type: "key",
    attributes: ["updatedAt"],
    collectionId: SPRINTS_COLLECTION_ID,
  });

  // Audit collection attributes
  await safeCreateAttribute(config, "string", {
    key: "taskId",
    size: 64,
    required: false,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "projectId",
    size: 64,
    required: false,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "entityType",
    size: 32,
    required: true,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "actionType",
    size: 64,
    required: true,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "message",
    size: 4000,
    required: true,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "meta",
    size: 10000,
    required: false,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdBy",
    size: 128,
    required: false,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: AUDIT_COLLECTION_ID,
  });

  await safeCreateIndex(config, "idx_taskId", {
    type: "key",
    attributes: ["taskId"],
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_projectId", {
    type: "key",
    attributes: ["projectId"],
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_createdAt", {
    type: "key",
    attributes: ["createdAt"],
    collectionId: AUDIT_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_actionType", {
    type: "key",
    attributes: ["actionType"],
    collectionId: AUDIT_COLLECTION_ID,
  });

  // Feedback collection attributes
  await safeCreateAttribute(config, "string", {
    key: "userId",
    size: 64,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "userName",
    size: 255,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "userEmail",
    size: 255,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "type",
    size: 32,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "title",
    size: 255,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "message",
    size: 10000,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "status",
    size: 32,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    default: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedAt",
    size: 64,
    required: true,
    array: false,
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_userId", {
    type: "key",
    attributes: ["userId"],
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_type", {
    type: "key",
    attributes: ["type"],
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_status", {
    type: "key",
    attributes: ["status"],
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_isActive", {
    type: "key",
    attributes: ["isActive"],
    collectionId: FEEDBACK_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_createdAt", {
    type: "key",
    attributes: ["createdAt"],
    collectionId: FEEDBACK_COLLECTION_ID,
  });

  // Notes collection attributes
  await safeCreateAttribute(config, "string", {
    key: "type",
    size: 32,
    required: true,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "title",
    size: 255,
    required: true,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "content",
    size: 50000,
    required: false,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "userId",
    size: 64,
    required: false,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "userName",
    size: 255,
    required: false,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "projectId",
    size: 64,
    required: false,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    default: true,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedByUserId",
    size: 64,
    required: false,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedAt",
    size: 64,
    required: true,
    array: false,
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_type", {
    type: "key",
    attributes: ["type"],
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_userId", {
    type: "key",
    attributes: ["userId"],
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_projectId", {
    type: "key",
    attributes: ["projectId"],
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_isActive", {
    type: "key",
    attributes: ["isActive"],
    collectionId: NOTES_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_updatedAt", {
    type: "key",
    attributes: ["updatedAt"],
    collectionId: NOTES_COLLECTION_ID,
  });

  // Users collection attributes
  await safeCreateAttribute(config, "string", {
    key: "name",
    size: 255,
    required: true,
    array: false,
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "email",
    size: 255,
    required: true,
    array: false,
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "passwordHash",
    size: 255,
    required: true,
    array: false,
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "gender",
    size: 16,
    required: false,
    array: false,
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "role",
    size: 32,
    required: true,
    array: false,
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    default: true,
    array: false,
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "updatedAt",
    size: 64,
    required: true,
    array: false,
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_email", {
    type: "unique",
    attributes: ["email"],
    collectionId: USERS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_isActive", {
    type: "key",
    attributes: ["isActive"],
    collectionId: USERS_COLLECTION_ID,
  });

  // Sessions collection attributes
  await safeCreateAttribute(config, "string", {
    key: "userId",
    size: 64,
    required: true,
    array: false,
    collectionId: SESSIONS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "tokenHash",
    size: 128,
    required: true,
    array: false,
    collectionId: SESSIONS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "expiresAt",
    size: 64,
    required: true,
    array: false,
    collectionId: SESSIONS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "boolean", {
    key: "isActive",
    required: false,
    default: true,
    array: false,
    collectionId: SESSIONS_COLLECTION_ID,
  });
  await safeCreateAttribute(config, "string", {
    key: "createdAt",
    size: 64,
    required: true,
    array: false,
    collectionId: SESSIONS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_userId", {
    type: "key",
    attributes: ["userId"],
    collectionId: SESSIONS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_tokenHash", {
    type: "unique",
    attributes: ["tokenHash"],
    collectionId: SESSIONS_COLLECTION_ID,
  });
  await safeCreateIndex(config, "idx_expiresAt", {
    type: "key",
    attributes: ["expiresAt"],
    collectionId: SESSIONS_COLLECTION_ID,
  });

  writeSchemaArtifacts(databaseId);
  syncEnvFile();

  console.log("Appwrite tasks collection is ready.");
  console.log(`Tasks Collection ID: ${TASKS_COLLECTION_ID}`);
  console.log("Appwrite comments collection is ready.");
  console.log(`Comments Collection ID: ${COMMENTS_COLLECTION_ID}`);
  console.log(`Projects Collection ID: ${PROJECTS_COLLECTION_ID}`);
  console.log(`Project Members Collection ID: ${PROJECT_MEMBERS_COLLECTION_ID}`);
  console.log(`Sprints Collection ID: ${SPRINTS_COLLECTION_ID}`);
  console.log(`Audit Collection ID: ${AUDIT_COLLECTION_ID}`);
  console.log(`Notes Collection ID: ${NOTES_COLLECTION_ID}`);
  console.log(`Users Collection ID: ${USERS_COLLECTION_ID}`);
  console.log(`Sessions Collection ID: ${SESSIONS_COLLECTION_ID}`);
  console.log(`Schema + resource output written to: ${path.relative(cwd, tablesDir)}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
