// Netlify Serverless Backend Auth Endpoint
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    if (!username || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Username and password are required." })
      };
    }

    const cleanUser = (username || "").trim().toLowerCase();

    const envAdminUser = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
    const envAdminPass = process.env.ADMIN_PASSWORD || "BaytLogic@MasterAdmin2026!";

    const isChiefUser = (envAdminUser && cleanUser === envAdminUser) || cleanUser === 'baytlogic@gmail.com' || cleanUser === 'aburuqayyah001@gmail.com';
    const isPassValid = password === envAdminPass;

    if (isChiefUser && isPassValid) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "jwt_token_" + Date.now() + "_" + Math.random().toString(36).substring(2),
          user: {
            name: "Chief Admin",
            email: cleanUser,
            role: "Chief Admin & Lead Engineer"
          }
        })
      };
    }

    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid username or password." })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server authentication error." })
    };
  }
};
