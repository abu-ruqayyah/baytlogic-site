exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { certId } = JSON.parse(event.body || "{}");

    if (!certId || certId.trim() === "") {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Please enter a certificate number." }) 
      };
    }

    // Secure database of valid certificates. 
    // New graduates are added here with padded ID formatting (e.g. BLT-2026-018).
    const certificateDatabase = {
      "BLT-2026-001": {
        name: "Ahmad Adamu Zakari",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "April 2, 2026",
        status: "Valid"
      },
      "BLT-2026-002": {
        name: "Abdulkadir Ahmed Tataru",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "April 2, 2026",
        status: "Valid"
      },
      "BLT-2026-003": {
        name: "Sulaiman Jibril Babayo",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "April 2, 2026",
        status: "Valid"
      },
      "BLT-2026-004": {
        name: "Dahiru Adamu",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "April 2, 2026",
        status: "Valid"
      },
      "BLT-2026-005": {
        name: "Saeed Haruna Saeed",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-006": {
        name: "Maryam Muhammad Ahmad",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-007": {
        name: "Toyyibat Abiola Shittu",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-008": {
        name: "Abdulshaheed Umar Chinade",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-009": {
        name: "Muhammad Bello Abubakar",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-010": {
        name: "Muhammad Ballo Mufty",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-011": {
        name: "Niimatullah Abimbola Shittu",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-012": {
        name: "Haleemat Suad Muhammad Ballo",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-013": {
        name: "Shamsuddeen Muhammad Ishaq",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-014": {
        name: "Ibrahim Muhammad Ballo",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-015": {
        name: "Na'ima Muhammad Ishaq",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-016": {
        name: "Abdullahi Rabi'u Muhammad",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      "BLT-2026-017": {
        name: "Abubakar Muhammad Chinade",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        status: "Valid"
      },
      // --- NEW GRADUATES: June 17, 2026 Masterclass ---
      "BLT-2026-018": {
        name: "Moshood Lukman Sekoni",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      },
      "BLT-2026-019": {
        name: "Ismail Abdullahi",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      },
      "BLT-2026-020": {
        name: "Muhammad Ukasha Abdullahi",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      },
      "BLT-2026-021": {
        name: "Abdulquadir Folorunso Adeshina",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      },
      "BLT-2026-022": {
        name: "Auwal Yahaya",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      },
      "BLT-2026-023": {
        name: "Abdullahi Yusuf Umar",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      },
      "BLT-2026-024": {
        name: "Fasilat Olopade Olawunmi",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      },
      "BLT-2026-025": {
        name: "Kareem Saheed Adeniyi",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      },
      "BLT-2026-026": {
        name: "Salihu Adamu Deba",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        status: "Valid"
      }
    };

    // 1. Clean formatting: Strip out all whitespaces and make uppercase
    let searchId = certId.replace(/\s+/g, "").toUpperCase();

    // 2. Fix potential typo formats (e.g. BLT2026018 -> BLT-2026-018)
    if (searchId.startsWith("BLT2026")) {
      searchId = "BLT-2026-" + searchId.substring(7);
    }

    // 3. Normalize leading zero padding (e.g. BLT-2026-18 -> BLT-2026-018)
    const match = searchId.match(/^(BLT-2026-)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numericPart = match[2].padStart(3, '0');
      searchId = prefix + numericPart;
    }

    const result = certificateDatabase[searchId];

    if (result) {
      // Certificate found!
      return {
        statusCode: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" // Allow cross-origin requests
        },
        body: JSON.stringify({ success: true, data: result })
      };
    } else {
      // Certificate not found
      return {
        statusCode: 404,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        },
        body: JSON.stringify({ success: false, error: "Invalid or unrecognized certificate number." })
      };
    }

  } catch (err) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Server error occurred." }) 
    };
  }
};