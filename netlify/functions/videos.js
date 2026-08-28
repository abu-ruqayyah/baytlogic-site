// Netlify Serverless Backend Videos Endpoint
let cachedVideos = null;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: ""
    };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  try {
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (body.videos && Array.isArray(body.videos)) {
        cachedVideos = body.videos;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, videos: cachedVideos })
        };
      }
    }

    // Default return cached or default videos without any placeholder video IDs
    const defaultVideos = [
      {
        id: 1,
        name: "Kareem Shaheed — YuNu Technologies",
        category: "Smart Home Automation",
        url: "https://drive.google.com/file/d/1v0sR0itU6-9HqGmkWhtY92GjwzCLnEkB/view?usp=drive_link",
        desc: "Kareem Shaheed demonstrating a live CCTV installation & Smart Home automation system deployed by his startup, YuNu Technologies in Kwara State."
      },
      {
        id: 2,
        name: "Muhammad Ukasha Abdullahi",
        category: "Smart Home Automation",
        url: "",
        desc: "Ukasha presenting his live automated Tuya Zigbee Relay & CCTV integration project during the June 2026 Masterclass."
      },
      {
        id: 3,
        name: "Fasilat Olopade Olawunmi",
        category: "CCTV & Security",
        url: "https://drive.google.com/file/d/1NnCscbhYB4g5NswRhwG92LRGa4MsgE-6/view?usp=drive_link",
        desc: "Fasilat demonstrating remote IP CCTV live feed setup and mobile NVR monitoring during the BaytLogic professional training."
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, videos: cachedVideos || defaultVideos })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Server error handling video requests" })
    };
  }
};
