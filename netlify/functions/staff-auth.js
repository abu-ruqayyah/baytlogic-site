// Netlify Serverless Backend Auth Endpoint
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    const cleanUser = (username || "").trim().toLowerCase();

    const chiefAdmins = {
      "baytlogic@gmail.com": { pass: process.env.ADMIN_PASSWORD || "BaytLogic@Master2026!", name: "Yahaya Abdullahi Sulaiman" },
      "aburuqayyah001@gmail.com": { pass: process.env.ADMIN_PASSWORD || "BaytLogic@Master2026!", name: "Abu Ruqayyah" },
      "info@baytlogic.com.ng": { pass: process.env.ADMIN_PASSWORD || "BaytLogic2026", name: "Yahaya Abdullahi Sulaiman" },
      "admin": { pass: process.env.ADMIN_PASSWORD || "BaytLogic2026", name: "Yahaya Abdullahi Sulaiman" }
    };

    if (chiefAdmins[cleanUser] && chiefAdmins[cleanUser].pass === password) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "jwt_token_" + Date.now(),
          user: {
            name: chiefAdmins[cleanUser].name,
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
