// Netlify Serverless Backend Auth Endpoint
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    const cleanUser = (username || "").trim().toLowerCase();

    // Read Chief Admin credentials directly from Netlify Environment Variables
    const envAdminUser = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
    const envAdminPass = process.env.ADMIN_PASSWORD;

    // Validate against Netlify Environment Variables
    if (envAdminUser && envAdminPass && cleanUser === envAdminUser && password === envAdminPass) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "jwt_token_" + Date.now(),
          user: {
            name: "Chief Admin",
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
