// Netlify Serverless Backend Auth Endpoint
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    // Secure environment variables or fallback server-side environment
    const envAdminUser = process.env.ADMIN_USERNAME || "info@baytlogic.com.ng";
    const envAdminPass = process.env.ADMIN_PASSWORD || "BaytLogic@Master2026!";

    if (
      (username === "admin" || username === envAdminUser) &&
      (password === envAdminPass)
    ) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "jwt_token_" + Date.now(),
          user: {
            name: "Yahaya Abdullahi Sulaiman",
            email: envAdminUser,
            role: "Chief Admin & Lead Engineer"
          }
        })
      };
    }

    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid username or password" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server authentication error" })
    };
  }
};
