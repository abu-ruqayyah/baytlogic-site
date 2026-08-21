// Netlify Serverless Backend Auth Endpoint
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { username, password } = JSON.parse(event.body || "{}");

    const cleanUser = (username || "").trim().toLowerCase();
    const validPasses = [process.env.ADMIN_PASSWORD || "BaytLogic2026", "BaytLogic2026", "BaytLogic@Master2026!"];

    const chiefAdmins = {
      "baytlogic@gmail.com": { name: "Yahaya Abdullahi Sulaiman" },
      "aburuqayyah001@gmail.com": { name: "Abu Ruqayyah" },
      "info@baytlogic.com.ng": { name: "Yahaya Abdullahi Sulaiman" },
      "admin": { name: "Yahaya Abdullahi Sulaiman" }
    };

    if (chiefAdmins[cleanUser] && validPasses.includes(password)) {
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

    if (cleanUser === "amzak" && password === "amzak@2025") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "jwt_token_" + Date.now(),
          user: {
            name: "Ahmad Adamu Zakari",
            email: "amzak",
            role: "Field Operations Engineer"
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
