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
        category: "Smart Home & CCTV",
        url: "assets/videos/kareem.mp4",
        desc: "Kareem Shaheed demonstrating live CCTV installation and Smart Home automation deployed by his startup, YuNu Technologies in Kwara State."
      },
      {
        id: 2,
        name: "Abdullahi Yusuf Umar",
        category: "Smart Home & CCTV",
        url: "assets/videos/abdullahi_yusuf.mp4",
        desc: "Abdullahi Yusuf presenting his live automated Tuya Zigbee Relay and IP CCTV integration project during the Masterclass."
      },
      {
        id: 3,
        name: "Fasilat Olopade Olawunmi",
        category: "Smart Home Automation",
        url: "assets/videos/fasilat.mp4",
        desc: "Fasilat demonstrating Smart Home automation controls, Tuya smart relays, and remote mobile surveillance during the BaytLogic training."
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
      },
      {
        id: 6,
        name: "Saeed Haruna Saeed",
        category: "Kids Robotics & STEM",
        url: "assets/videos/saeed.mp4",
        desc: "Saeed demonstrating his autonomous mobile robot circuitry and embedded logic programming during the Young Innovators Robotics Bootcamp."
      },
      {
        id: 7,
        name: "Muhammad Bello Abubakar",
        category: "Kids Robotics & STEM",
        url: "assets/videos/muhammad_bello.mp4",
        desc: "Muhammad Bello showcasing his smart sensor robotics build and motor steering automation project at BaytLogic Academy."
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
