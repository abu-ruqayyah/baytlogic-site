// Netlify Serverless Backend — Persistent Staff Auth & Account Management
// Stores staff accounts permanently in Netlify Blobs so created users can sign in from ANY device
// and accounts never disappear when browser cache/localStorage is cleared.

const crypto = require("crypto");

let blobsModule = null;
try {
  blobsModule = require("@netlify/blobs");
} catch (_) {
  blobsModule = null;
}

// Local dev fallback store (used only if running outside Netlify environment)
let memoryFallbackAccounts = [];

const CHIEF_ADMINS = [
  { id: "usr-chief-1", name: "Abu Ruqayyah", username: "aburuqayyah001@gmail.com", role: "Chief Admin & Lead Engineer" },
  { id: "usr-chief-2", name: "BaytLogic Chief Admin", username: "baytlogic@gmail.com", role: "Chief Admin" }
];

function getAdminSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "BaytLogic@MasterAdmin2026!";
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "BaytLogic@MasterAdmin2026!";
}

function isChiefUsername(username) {
  const clean = (username || "").trim().toLowerCase();
  const envAdmin = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
  return (
    (envAdmin && clean === envAdmin) ||
    clean === "baytlogic@gmail.com" ||
    clean === "aburuqayyah001@gmail.com"
  );
}

function hashPassword(password, saltHex) {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  if (!storedHash.includes(":")) {
    return password === storedHash;
  }
  const [salt, originalHex] = storedHash.split(":");
  const derivedHex = crypto.scryptSync(String(password), salt, 64).toString("hex");
  const a = Buffer.from(originalHex, "hex");
  const b = Buffer.from(derivedHex, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function signToken(payloadObj) {
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const sig = crypto.createHmac("sha256", getAdminSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", getAdminSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function getBlobStore(event) {
  if (!blobsModule) return null;
  try {
    if (typeof blobsModule.connectLambda === "function") {
      blobsModule.connectLambda(event);
    }
    return blobsModule.getStore("baytlogic-staff");
  } catch (err) {
    console.warn("Netlify Blobs unavailable, using memory fallback:", err.message);
    return null;
  }
}

async function loadStaffAccounts(event) {
  const store = await getBlobStore(event);
  if (store) {
    try {
      const data = await store.get("accounts", { type: "json" });
      if (Array.isArray(data)) return data;
      return [];
    } catch (err) {
      console.warn("Failed reading Blobs store:", err.message);
    }
  }
  return memoryFallbackAccounts;
}

async function saveStaffAccounts(event, accounts) {
  const store = await getBlobStore(event);
  if (store) {
    await store.setJSON("accounts", accounts);
    return true;
  }
  memoryFallbackAccounts = accounts;
  return false;
}

function sanitizeAccountsForClient(staffList) {
  const chiefs = CHIEF_ADMINS.map(c => ({
    ...c,
    isChief: true,
    password: "••••••••"
  }));
  const staff = staffList.map(s => ({
    id: s.id,
    name: s.name,
    username: s.username,
    role: s.role || "Field Operations Engineer",
    createdAt: s.createdAt || null,
    isChief: false,
    password: "••••••••"
  }));
  return [...chiefs, ...staff];
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const action = (body.action || "login").toLowerCase();

    // ==================== 1. LOGIN (CHIEF ADMIN OR STAFF) ====================
    if (action === "login") {
      const username = (body.username || "").trim();
      const password = body.password || "";

      if (!username || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Username and password are required." })
        };
      }

      const cleanUser = username.toLowerCase();

      // Check Chief Admin first
      if (isChiefUsername(cleanUser) && password === getAdminPassword()) {
        const chiefProfile = CHIEF_ADMINS.find(c => c.username === cleanUser) || {
          id: "usr-chief-env",
          name: "Chief Admin",
          username: cleanUser,
          role: "Chief Admin & Lead Engineer"
        };
        const user = {
          id: chiefProfile.id,
          name: chiefProfile.name,
          email: cleanUser,
          username: cleanUser,
          role: chiefProfile.role,
          isChief: true
        };
        const token = signToken({ sub: cleanUser, isChief: true, iat: Date.now() });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, token, user })
        };
      }

      // Check persistent cloud Staff Accounts in Netlify Blobs
      const staffAccounts = await loadStaffAccounts(event);
      const match = staffAccounts.find(
        acc => (acc.username || "").trim().toLowerCase() === cleanUser
      );

      if (match && verifyPassword(password, match.passwordHash || match.password)) {
        const user = {
          id: match.id,
          name: match.name,
          email: match.username,
          username: match.username,
          role: match.role || "Field Staff",
          isChief: false
        };
        const token = signToken({ sub: cleanUser, isChief: false, iat: Date.now() });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, token, user })
        };
      }

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid username or password." })
      };
    }

    // ==================== AUTHORIZATION FOR ADMIN ACTIONS ====================
    const authHeader = event.headers?.authorization || event.headers?.Authorization || "";
    const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : (body.token || "");
    const decoded = verifyToken(bearerToken);

    if (!decoded || !decoded.isChief) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "Chief Admin authorization required. Please log out and sign in again." })
      };
    }

    // ==================== 2. LIST ACCOUNTS ====================
    if (action === "list") {
      const staffAccounts = await loadStaffAccounts(event);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          accounts: sanitizeAccountsForClient(staffAccounts)
        })
      };
    }

    // ==================== 3. CREATE / UPDATE STAFF ACCOUNT ====================
    if (action === "create") {
      const acc = body.account || {};
      const name = (acc.name || "").trim();
      const username = (acc.username || "").trim().toLowerCase();
      const password = (acc.password || "").trim();
      const role = (acc.role || "Field Operations Engineer").trim();

      if (!name || !username || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Name, username, and password are required." })
        };
      }

      if (isChiefUsername(username)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Cannot overwrite Chief Admin account." })
        };
      }

      const staffAccounts = await loadStaffAccounts(event);
      const existingIdx = staffAccounts.findIndex(
        a => (a.username || "").trim().toLowerCase() === username
      );

      const record = {
        id: existingIdx >= 0 ? staffAccounts[existingIdx].id : "usr-" + Date.now(),
        name,
        username,
        role,
        passwordHash: hashPassword(password),
        createdAt: existingIdx >= 0 ? staffAccounts[existingIdx].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        staffAccounts[existingIdx] = record;
      } else {
        staffAccounts.push(record);
      }

      const persistedToCloud = await saveStaffAccounts(event, staffAccounts);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          persistedToCloud,
          accounts: sanitizeAccountsForClient(staffAccounts)
        })
      };
    }

    // ==================== 4. DELETE STAFF ACCOUNT ====================
    if (action === "delete") {
      const id = body.id;
      if (!id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "Account ID required." }) };
      }
      const staffAccounts = await loadStaffAccounts(event);
      const filtered = staffAccounts.filter(a => a.id !== id);
      await saveStaffAccounts(event, filtered);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          accounts: sanitizeAccountsForClient(filtered)
        })
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action." }) };
  } catch (err) {
    console.error("staff-auth error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server authentication error." })
    };
  }
};
