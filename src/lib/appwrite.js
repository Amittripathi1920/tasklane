import { Client, Databases, Functions, ID, Query, Storage } from "appwrite";
import { scrypt } from "scrypt-js";

const config = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  tasksCollectionId: import.meta.env.VITE_APPWRITE_TASKS_COLLECTION_ID,
  projectsCollectionId:
    import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID || "tasklane_projects",
  projectMembersCollectionId:
    import.meta.env.VITE_APPWRITE_PROJECT_MEMBERS_COLLECTION_ID || "tasklane_project_members",
  sprintsCollectionId:
    import.meta.env.VITE_APPWRITE_SPRINTS_COLLECTION_ID || "tasklane_sprints",
  auditCollectionId:
    import.meta.env.VITE_APPWRITE_AUDIT_COLLECTION_ID || "tasklane_audit",
  feedbackCollectionId:
    import.meta.env.VITE_APPWRITE_FEEDBACK_COLLECTION_ID || "tasklane_feedback",
  notesCollectionId:
    import.meta.env.VITE_APPWRITE_NOTES_COLLECTION_ID || "tasklane_notes",
  commentsCollectionId:
    import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || "tasklane_comments",
  subtasksCollectionId:
    import.meta.env.VITE_APPWRITE_SUBTASKS_COLLECTION_ID || "tasklane_subtasks",
  usersCollectionId:
    import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || "tasklane_users",
  sessionsCollectionId:
    import.meta.env.VITE_APPWRITE_SESSIONS_COLLECTION_ID || "tasklane_sessions",
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  aiFunctionId: import.meta.env.VITE_APPWRITE_AI_FUNCTION_ID,
  authFunctionId: import.meta.env.VITE_APPWRITE_AUTH_FUNCTION_ID,
};

const requiredFrontendConfig = [
  "endpoint",
  "projectId",
  "databaseId",
  "tasksCollectionId",
  "projectsCollectionId",
  "projectMembersCollectionId",
  "sprintsCollectionId",
  "auditCollectionId",
  "feedbackCollectionId",
  "notesCollectionId",
  "commentsCollectionId",
  "subtasksCollectionId",
  "usersCollectionId",
  "sessionsCollectionId",
  "bucketId",
  "aiFunctionId",
  "authFunctionId",
];

export const missingConfig = requiredFrontendConfig.filter((key) => !config[key]);

let databases;
let storage;
let functions;

if (missingConfig.length === 0) {
  const client = new Client().setEndpoint(config.endpoint).setProject(config.projectId);
  databases = new Databases(client);
  storage = new Storage(client);
  functions = new Functions(client);
}

function assertConfigured() {
  if (missingConfig.length > 0) {
    throw new Error(`Missing configuration: ${missingConfig.join(", ")}`);
  }
}

async function listAll(collectionId, queries = []) {
  assertConfigured();
  const response = await databases.listDocuments(config.databaseId, collectionId, [
    Query.limit(500),
    ...queries,
  ]);
  return response.documents || [];
}

export async function fetchTasks() {
  return listAll(config.tasksCollectionId, [Query.orderDesc("updatedAt")]);
}

export async function fetchProjects() {
  return listAll(config.projectsCollectionId, [Query.orderDesc("updatedAt")]);
}

export async function fetchProjectMembers() {
  return listAll(config.projectMembersCollectionId, [Query.orderDesc("updatedAt")]);
}

export async function fetchSprints() {
  return listAll(config.sprintsCollectionId, [Query.orderDesc("updatedAt")]);
}

export async function fetchAuditEntries() {
  return listAll(config.auditCollectionId, [Query.orderDesc("createdAt")]);
}

export async function fetchFeedbackEntries() {
  return listAll(config.feedbackCollectionId, [Query.orderDesc("createdAt")]);
}

export async function fetchNotes() {
  return listAll(config.notesCollectionId, [Query.orderDesc("updatedAt")]);
}

export async function fetchComments() {
  return listAll(config.commentsCollectionId, [Query.orderDesc("createdAt")]);
}

export async function fetchSubtasks() {
  return listAll(config.subtasksCollectionId, [Query.orderDesc("createdAt")]);
}

export async function createTask(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.tasksCollectionId, ID.unique(), payload);
}

export async function createProject(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.projectsCollectionId, ID.unique(), payload);
}

export async function createProjectMember(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.projectMembersCollectionId, ID.unique(), payload);
}

export async function createSprint(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.sprintsCollectionId, ID.unique(), payload);
}

export async function createAuditEntry(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.auditCollectionId, ID.unique(), payload);
}

export async function createFeedbackEntry(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.feedbackCollectionId, ID.unique(), payload);
}

export async function createNote(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.notesCollectionId, ID.unique(), payload);
}

export async function updateFeedbackEntry(documentId, payload) {
  assertConfigured();
  return databases.updateDocument(config.databaseId, config.feedbackCollectionId, documentId, payload);
}

export async function updateNote(documentId, payload) {
  assertConfigured();
  return databases.updateDocument(config.databaseId, config.notesCollectionId, documentId, payload);
}

export async function updateProject(documentId, payload) {
  assertConfigured();
  return databases.updateDocument(config.databaseId, config.projectsCollectionId, documentId, payload);
}

export async function updateProjectMember(documentId, payload) {
  assertConfigured();
  return databases.updateDocument(config.databaseId, config.projectMembersCollectionId, documentId, payload);
}

export async function updateSprint(documentId, payload) {
  assertConfigured();
  return databases.updateDocument(config.databaseId, config.sprintsCollectionId, documentId, payload);
}

export async function updateTask(documentId, payload) {
  assertConfigured();
  return databases.updateDocument(config.databaseId, config.tasksCollectionId, documentId, payload);
}

export async function createComment(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.commentsCollectionId, ID.unique(), payload);
}

export async function updateComment(documentId, payload) {
  assertConfigured();
  return databases.updateDocument(config.databaseId, config.commentsCollectionId, documentId, payload);
}

export async function createSubtask(payload) {
  assertConfigured();
  return databases.createDocument(config.databaseId, config.subtasksCollectionId, ID.unique(), payload);
}

export async function updateSubtask(documentId, payload) {
  assertConfigured();
  return databases.updateDocument(config.databaseId, config.subtasksCollectionId, documentId, payload);
}

export async function uploadCommentImage(file) {
  assertConfigured();
  const uploaded = await storage.createFile(config.bucketId, ID.unique(), file);
  return String(storage.getFileView(config.bucketId, uploaded.$id));
}

export async function runAiAction(payload) {
  assertConfigured();
  const execution = await functions.createExecution(
    config.aiFunctionId,
    JSON.stringify(payload),
    false,
    "/",
    "POST",
    { "content-type": "application/json" },
  );

  const body = execution.responseBody || "{}";
  const parsed = JSON.parse(body);
  if (!parsed.ok) {
    throw new Error(parsed.error || "AI action failed");
  }
  return parsed;
}

function safeUser(doc) {
  if (!doc) return null;
  return {
    $id: doc.$id,
    name: doc.name,
    email: doc.email,
    gender: doc.gender || "Male",
    role: doc.role,
    isActive: doc.isActive !== false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  if (!hex || typeof hex !== "string" || hex.length % 2 !== 0) return new Uint8Array();
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    out[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
  }
  return out;
}

function randomHex(bytes = 16) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return bytesToHex(buffer);
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

async function hashPasswordBrowser(password) {
  const salt = randomHex(16);
  const derived = await scrypt(new TextEncoder().encode(password), hexToBytes(salt), 16384, 8, 1, 64);
  return `scrypt$${salt}$${bytesToHex(derived)}`;
}

async function verifyPasswordBrowser(password, storedHash) {
  if (!storedHash || !storedHash.startsWith("scrypt$")) return false;
  const [, salt, expected] = storedHash.split("$");
  if (!salt || !expected) return false;
  const derived = await scrypt(new TextEncoder().encode(password), hexToBytes(salt), 16384, 8, 1, 64);
  return bytesToHex(derived) === expected;
}

async function getUserByEmail(email) {
  const docs = await databases.listDocuments(config.databaseId, config.usersCollectionId, [
    Query.equal("email", normalizeEmail(email)),
    Query.limit(1),
  ]);
  return docs.documents?.[0] || null;
}

async function getSessionByTokenHash(tokenHash) {
  const docs = await databases.listDocuments(config.databaseId, config.sessionsCollectionId, [
    Query.equal("tokenHash", tokenHash),
    Query.limit(1),
  ]);
  return docs.documents?.[0] || null;
}

async function createCustomSession(userId) {
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 168 * 60 * 60 * 1000).toISOString();
  await databases.createDocument(config.databaseId, config.sessionsCollectionId, ID.unique(), {
    userId,
    tokenHash,
    expiresAt,
    isActive: true,
    createdAt: now.toISOString(),
  });
  return { token, expiresAt };
}

async function validateCustomSession(token) {
  if (!token) {
    throw new Error("Missing session token.");
  }
  const tokenHash = await sha256Hex(token);
  const session = await getSessionByTokenHash(tokenHash);
  if (!session || session.isActive === false) {
    throw new Error("Session is invalid.");
  }
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await databases.updateDocument(config.databaseId, config.sessionsCollectionId, session.$id, { isActive: false });
    throw new Error("Session expired.");
  }
  const user = await databases.getDocument(config.databaseId, config.usersCollectionId, session.userId).catch(() => null);
  if (!user || user.isActive === false) {
    throw new Error("User account is inactive.");
  }
  return { session, user };
}

export async function runAuthAction(payload) {
  assertConfigured();
  const action = payload?.action;

  if (action === "signup") {
    const name = String(payload.name || "").trim();
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required.");
    }
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    const existing = await getUserByEmail(email);
    if (existing) {
      throw new Error("An account with this email already exists.");
    }
    const firstUserCheck = await databases.listDocuments(config.databaseId, config.usersCollectionId, [Query.limit(1)]);
    const now = new Date().toISOString();
    const user = await databases.createDocument(config.databaseId, config.usersCollectionId, ID.unique(), {
      name,
      email,
      passwordHash: await hashPasswordBrowser(password),
      gender: "Male",
      role: Number(firstUserCheck.total || 0) === 0 ? "Admin" : "Member",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const session = await createCustomSession(user.$id);
    return { ok: true, user: safeUser(user), ...session };
  }

  if (action === "login") {
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }
    const user = await getUserByEmail(email);
    if (!user || user.isActive === false) {
      throw new Error("Invalid email or password.");
    }
    const valid = await verifyPasswordBrowser(password, user.passwordHash || "");
    if (!valid) {
      throw new Error("Invalid email or password.");
    }
    const session = await createCustomSession(user.$id);
    await databases.updateDocument(config.databaseId, config.usersCollectionId, user.$id, {
      updatedAt: new Date().toISOString(),
    });
    return { ok: true, user: safeUser(user), ...session };
  }

  if (action === "validate") {
    const { session, user } = await validateCustomSession(String(payload.token || ""));
    return { ok: true, user: safeUser(user), expiresAt: session.expiresAt };
  }

  if (action === "logout") {
    const { session } = await validateCustomSession(String(payload.token || ""));
    await databases.updateDocument(config.databaseId, config.sessionsCollectionId, session.$id, {
      isActive: false,
    });
    return { ok: true, success: true };
  }

  if (action === "directory") {
    await validateCustomSession(String(payload.token || ""));
    const docs = await databases.listDocuments(config.databaseId, config.usersCollectionId, [Query.limit(500)]);
    const users = (docs.documents || [])
      .filter((user) => user.isActive !== false)
      .map((user) => safeUser(user))
      .sort((a, b) => String(a.name || a.email).localeCompare(String(b.name || b.email)));
    return { ok: true, users };
  }

  if (action === "update_profile") {
    const { user } = await validateCustomSession(String(payload.token || ""));
    const name = String(payload.name || "").trim();
    const gender = ["Male", "Female", "Other"].includes(String(payload.gender || "")) ? String(payload.gender) : "Male";
    if (!name) {
      throw new Error("Name is required.");
    }
    const updated = await databases.updateDocument(config.databaseId, config.usersCollectionId, user.$id, {
      name,
      gender,
      updatedAt: new Date().toISOString(),
    });
    return { ok: true, user: safeUser(updated) };
  }

  throw new Error("Unsupported auth action.");
}

export { config };
