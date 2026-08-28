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

    // Default return cached or default local MP4 videos
    const defaultVideos = [
      {
        id: 1,
        name: "Kareem Shaheed — YuNu Technologies",
        category: "Smart Home Automation",
        url: "assets/videos/kareem.mp4",
        desc: "Kareem Shaheed demonstrating a live CCTV installation & Smart Home automation system deployed by his startup, YuNu Technologies in Kwara State."
      },
      {
        id: 2,
        name: "Abdullahi Yusuf Umar",
        category: "Smart Home Automation",
        url: "assets/videos/abdullahi_yusuf.mp4",
        desc: "Abdullahi Yusuf presenting his live automated Tuya Zigbee Relay & CCTV integration project during the June 2026 Masterclass."
      },
      {
        id: 3,
        name: "Fasilat Olopade Olawunmi",
        category: "CCTV & Security",
        url: "assets/videos/fasilat.mp4",
        desc: "Fasilat demonstrating remote IP CCTV live feed setup and mobile NVR monitoring during the BaytLogic professional training."
      },
      {
        id: 4,
        name: "Abdullahi Rabi'u Muhammad",
        category: "Kids Robotics & STEM",
        url: "assets/videos/abdullahi_rabiu.mp4",
        desc: "Abdullahi Rabi'u demonstrating his autonomous obstacle-avoiding mobile robot project during the Young Innovators Robotics Bootcamp."
      },
      {
        id: 5,
        name: "Na'ima Muhammad Ishaq",
        category: "Kids Robotics & STEM",
        url: "assets/videos/naima.mp4",
        desc: "Na'ima demonstrating her interactive smart sensors and motor control robotics project at BaytLogic Young Innovators Bootcamp."
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
