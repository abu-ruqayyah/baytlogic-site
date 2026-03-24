export async function handler(event) {
  const data = JSON.parse(event.body || "{}");

  console.log("QR Interaction:", data.type);

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
}