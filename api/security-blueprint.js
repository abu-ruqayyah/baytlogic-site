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
    const description = body.description;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({ error: "Missing description" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
    }

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({ error: data?.error?.message || "Gemini error" });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No output generated.";
    return res.status(200).json({ text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
