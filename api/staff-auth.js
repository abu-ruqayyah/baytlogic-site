module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { username, password } = body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const cleanUser = username.trim().toLowerCase();

    // Read Chief Admin credentials from environment variables or secure default
    const envAdminUser = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
    const envAdminPass = process.env.ADMIN_PASSWORD || "BaytLogic@MasterAdmin2026!";

    // Validate Chief Admin credentials
    const isChiefUser = (envAdminUser && cleanUser === envAdminUser) || cleanUser === 'baytlogic@gmail.com' || cleanUser === 'aburuqayyah001@gmail.com';
    const isPassValid = password === envAdminPass;

    if (isChiefUser && isPassValid) {
      return res.status(200).json({
        token: "jwt_token_" + Date.now() + "_" + Math.random().toString(36).substring(2),
        user: {
          name: "Chief Admin",
          email: cleanUser,
          role: "Chief Admin & Lead Engineer"
        }
      });
    }

    return res.status(401).json({ error: "Invalid username or password." });
  } catch (err) {
    return res.status(500).json({ error: "Server authentication error." });
  }
};
