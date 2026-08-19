exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Click tracked successfully", timestamp: new Date().toISOString() })
  };
};