import crypto from "node:crypto";

function parsePayload(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const raw = req.bodyText || req.body || "{}";
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function json(res, status, body) {
  return res.json(body, status);
}

function requiredEnv(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key} in function variables.`);
  return value;
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith("scrypt$")) return false;
  const [, salt, expected] = storedHash.split("$");
  if (!salt || !expected) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(derived, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
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

function buildUrl(endpoint, uri, query = {}) {
  const base = (endpoint || "").replace(/\/+$/, "");
  const cleanUri = base.endsWith("/v1") && uri.startsWith("/v1") ? uri.replace(/^\/v1/, "") : uri;
  const url = new URL(`${base}${cleanUri}`);
  Object.entries(query).forEach(([key, value]) => {
    const paramKey = key === "queries" ? "queries[]" : key;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(paramKey, item));
    } else if (typeof value !== "undefined" && value !== null) {
      url.searchParams.set(paramKey, String(value));
    }
  });
  return url.toString();
}

function queryEqual(attribute, value) {
  return `equal(${JSON.stringify(attribute)}, [${JSON.stringify(String(value))}])`;
}

function queryLimit(limit) {
  return `limit(${Math.max(1, Number(limit) || 1)})`;
}

async function appwriteRequest({ method, uri, body, query }) {
  const endpoint = requiredEnv("APPWRITE_ENDPOINT");
  const projectId = requiredEnv("APPWRITE_PROJECT_ID");
  const apiKey = requiredEnv("APPWRITE_API_KEY");
  const response = await fetch(buildUrl(endpoint, uri, query), {
    method,
    headers: {
      "content-type": "application/json",
      "x-appwrite-project": projectId,
      "x-appwrite-key": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || `Appwrite request failed with ${response.status}`);
  }
  return data;
}

async function listDocuments(collectionId, queries = []) {
  const databaseId = requiredEnv("APPWRITE_DATABASE_ID");
  return appwriteRequest({
    method: "GET",
    uri: `/v1/databases/${databaseId}/collections/${collectionId}/documents`,
    query: { queries },
  });
}

async function getDocument(collectionId, documentId) {
  const databaseId = requiredEnv("APPWRITE_DATABASE_ID");
  return appwriteRequest({
    method: "GET",
    uri: `/v1/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`,
  });
}

async function createDocument(collectionId, documentId, data) {
  const databaseId = requiredEnv("APPWRITE_DATABASE_ID");
  return appwriteRequest({
    method: "POST",
    uri: `/v1/databases/${databaseId}/collections/${collectionId}/documents`,
    body: { documentId, data },
  });
}

async function updateDocument(collectionId, documentId, data) {
  const databaseId = requiredEnv("APPWRITE_DATABASE_ID");
  return appwriteRequest({
    method: "PATCH",
    uri: `/v1/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`,
    body: { data },
  });
}

async function findUserByEmail(email) {
  const usersCollectionId = requiredEnv("USERS_COLLECTION_ID");
  const response = await listDocuments(usersCollectionId, [queryEqual("email", email), queryLimit(1)]);
  return response.documents?.[0] || null;
}

async function findSessionByTokenHash(tokenHash) {
  const sessionsCollectionId = requiredEnv("SESSIONS_COLLECTION_ID");
  const response = await listDocuments(sessionsCollectionId, [queryEqual("tokenHash", tokenHash), queryLimit(1)]);
  return response.documents?.[0] || null;
}

async function createSession(user) {
  const sessionsCollectionId = requiredEnv("SESSIONS_COLLECTION_ID");
  const ttlHours = Number(process.env.SESSION_TTL_HOURS || 168);
  const token = randomToken();
  const now = new Date();
  const expiresAt = addHours(now, ttlHours).toISOString();
  const session = await createDocument(sessionsCollectionId, "unique()", {
    userId: user.$id,
    tokenHash: sha256(token),
    expiresAt,
    isActive: true,
    createdAt: now.toISOString(),
  });
  return { token, expiresAt, session };
}

async function validateSessionToken(token) {
  if (!token) throw new Error("Missing session token.");
  const session = await findSessionByTokenHash(sha256(token));
  if (!session || session.isActive === false) throw new Error("Session is invalid.");
  if (Date.parse(session.expiresAt) <= Date.now()) {
    await updateDocument(requiredEnv("SESSIONS_COLLECTION_ID"), session.$id, { isActive: false });
    throw new Error("Session expired.");
  }
  const user = await getDocument(requiredEnv("USERS_COLLECTION_ID"), session.userId).catch(() => null);
  if (!user || user.isActive === false) throw new Error("User account is inactive.");
  return { session, user };
}

async function signup(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const name = String(payload.name || "").trim();
  if (!name || !email || !password) throw new Error("Name, email, and password are required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  const existingUsers = await listDocuments(requiredEnv("USERS_COLLECTION_ID"), [queryLimit(1)]);
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("An account with this email already exists.");
  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);
  const user = await createDocument(requiredEnv("USERS_COLLECTION_ID"), "unique()", {
    name,
    email,
    passwordHash,
    gender: "Male",
    role: Number(existingUsers.total || 0) === 0 ? "Admin" : "Member",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  const { token, expiresAt } = await createSession(user);
  return { user: safeUser(user), token, expiresAt };
}

async function login(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  if (!email || !password) throw new Error("Email and password are required.");
  const user = await findUserByEmail(email);
  if (!user || user.isActive === false) throw new Error("Invalid email or password.");
  const ok = verifyPassword(password, user.passwordHash || "");
  if (!ok) throw new Error("Invalid email or password.");
  const { token, expiresAt } = await createSession(user);
  await updateDocument(requiredEnv("USERS_COLLECTION_ID"), user.$id, { updatedAt: new Date().toISOString() });
  return { user: safeUser(user), token, expiresAt };
}

async function validate(payload) {
  const { session, user } = await validateSessionToken(String(payload.token || ""));
  return { user: safeUser(user), expiresAt: session.expiresAt };
}

async function logout(payload) {
  const { session } = await validateSessionToken(String(payload.token || ""));
  await updateDocument(requiredEnv("SESSIONS_COLLECTION_ID"), session.$id, { isActive: false });
  return { success: true };
}

async function directory(payload) {
  await validateSessionToken(String(payload.token || ""));
  const response = await listDocuments(requiredEnv("USERS_COLLECTION_ID"), [queryLimit(100)]);
  return {
    users: (response.documents || [])
      .filter((user) => user.isActive !== false)
      .map((user) => safeUser(user))
      .sort((a, b) => String(a.name || a.email).localeCompare(String(b.name || b.email))),
  };
}

async function updateProfile(payload) {
  const { user } = await validateSessionToken(String(payload.token || ""));
  const name = String(payload.name || "").trim();
  const gender = ["Male", "Female", "Other"].includes(String(payload.gender || "")) ? String(payload.gender) : "Male";
  if (!name) throw new Error("Name is required.");
  const updated = await updateDocument(requiredEnv("USERS_COLLECTION_ID"), user.$id, {
    name,
    gender,
    updatedAt: new Date().toISOString(),
  });
  return { user: safeUser(updated) };
}

export default async ({ req, res, error }) => {
  try {
    const payload = parsePayload(req);
    const action = payload.action;
    if (action === "signup") return json(res, 200, { ok: true, ...(await signup(payload)) });
    if (action === "login") return json(res, 200, { ok: true, ...(await login(payload)) });
    if (action === "validate") return json(res, 200, { ok: true, ...(await validate(payload)) });
    if (action === "logout") return json(res, 200, { ok: true, ...(await logout(payload)) });
    if (action === "directory") return json(res, 200, { ok: true, ...(await directory(payload)) });
    if (action === "update_profile") return json(res, 200, { ok: true, ...(await updateProfile(payload)) });
    return json(res, 400, { ok: false, error: "Unsupported auth action." });
  } catch (err) {
    error(err.message || String(err));
    return json(res, 400, { ok: false, error: err.message || "Auth request failed." });
  }
};
