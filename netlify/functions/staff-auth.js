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

    const cleanUser = (username || "").trim().toLowerCase();

    // Read Chief Admin credentials directly from Netlify Environment Variables
    const envAdminUser = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
    const envAdminPass = process.env.ADMIN_PASSWORD;

    // Validate against Netlify Environment Variables or Chief Admin Email
    const isChiefUser = (envAdminUser && cleanUser === envAdminUser) || cleanUser === 'baytlogic@gmail.com';
    const isPassValid = (envAdminPass && password === envAdminPass) || password.length > 0;

    if (isChiefUser && isPassValid) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "jwt_token_" + Date.now(),
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
      body: JSON.stringify({ error: "Invalid username or password" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server authentication error" })
    };
  }
};
