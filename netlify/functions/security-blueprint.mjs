import { GoogleGenAI } from "@google/genai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const json = (body, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

export default async (req) => {
  // CORS preflight support
  if (req.method === "OPTIONS") {
    return new Response("", { status: 200, headers: corsHeaders });
  }

  // Only allow POST requests from your frontend
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { description } = await req.json().catch(() => ({}));

    if (!description || typeof description !== "string" || description.trim().length < 5) {
      return json({ error: "Missing description" }, 400);
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

    // Credentials are injected at runtime by Netlify AI Gateway
    const ai = new GoogleGenAI({});

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt
    });

    const text = response.text || "No output generated.";

    return json({ text });
  } catch (err) {
    console.error(err);
    return json({ error: err.message || "Server error" }, err.status || 500);
  }
};
