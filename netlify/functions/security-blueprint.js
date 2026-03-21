// Put this file in your actual project at: netlify/functions/security-blueprint.js

exports.handler = async function(event, context) {
  // Only allow POST requests from your frontend
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { description } = JSON.parse(event.body || "{}");
    
    // Excellent input validation from your original code
    if (!description || description.trim().length < 5) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing description" }) };
    }

    // SECURE WAY: This pulls the key from Netlify's Environment Variables.
    // Do NOT paste the actual "AIza..." string into this file.
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Server missing GEMINI_API_KEY" }) };
    }

    // Your highly detailed, professional prompt
    const prompt = `You are a senior security engineer at BaytLogic Technologies.
Generate a professional SECURITY BLUEPRINT for a Nigerian context.

Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
Property Description: "${description}"

Include these sections:
1) Vulnerability Assessment
2) Recommended CCTV Setup (channels, camera types, placement guidance)
3) IoT Sensors (motion, door/window, siren, access control where relevant)
4) Network & Security (segmentation, passwords, remote access hardening)
5) Power Reliability (solar/inverter backup recommendations where relevant)
6) Next Steps (site survey, BOQ, deployment timeline)

Tone: Corporate, authoritative, non-dramatic.
Output as clear Markdown with bullet points.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: data?.error?.message || "Gemini error" })
      };
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No output generated.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
};