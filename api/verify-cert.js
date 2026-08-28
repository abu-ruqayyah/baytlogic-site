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
    const { certId } = body;

    if (!certId || certId.trim() === "") {
      return res.status(400).json({ error: "Please enter a certificate number." });
    }

    // Secure database of valid certificates. 
    // New graduates are added here with padded ID formatting (e.g. BLT-2026-018).
    const certificateDatabase = {
      "BLT-2026-001": {
        name: "Ahmad Adamu Zakari",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "April 2, 2026",
        partner: "Nurtureroots Foundation",
        status: "Valid"
      },
      "BLT-2026-002": {
        name: "Abdulkadir Ahmed Tataru",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "April 2, 2026",
        partner: "Nurtureroots Foundation",
        status: "Valid"
      },
      "BLT-2026-003": {
        name: "Sulaiman Jibril Babayo",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "April 2, 2026",
        partner: "Nurtureroots Foundation",
        status: "Valid"
      },
      "BLT-2026-004": {
        name: "Dahiru Adamu",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "April 2, 2026",
        partner: "Nurtureroots Foundation",
        status: "Valid"
      },
      "BLT-2026-005": {
        name: "Saeed Haruna Saeed",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-006": {
        name: "Maryam Muhammad Ahmad",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-007": {
        name: "Toyyibat Abiola Shittu",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-008": {
        name: "Abdulshaheed Umar Chinade",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-009": {
        name: "Muhammad Bello Abubakar",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-010": {
        name: "Muhammad Ballo Mufty",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-011": {
        name: "Niimatullah Abimbola Shittu",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-012": {
        name: "Haleemat Suad Muhammad Ballo",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-013": {
        name: "Shamsuddeen Muhammad Ishaq",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-014": {
        name: "Ibrahim Muhammad Ballo",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-015": {
        name: "Na'ima Muhammad Ishaq",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-016": {
        name: "Abdullahi Rabi'u Muhammad",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      "BLT-2026-017": {
        name: "Abubakar Muhammad Chinade",
        course: "Young Innovators Robotics Bootcamp - Level 1",
        issueDate: "April 24, 2026",
        partner: "Nasscomsoft",
        status: "Valid"
      },
      // --- NEW GRADUATES: June 17, 2026 Masterclass ---
      "BLT-2026-018": {
        name: "Moshood Lukman Sekoni",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      },
      "BLT-2026-019": {
        name: "Ismail Abdullahi",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      },
      "BLT-2026-020": {
        name: "Muhammad Ukasha Abdullahi",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      },
      "BLT-2026-021": {
        name: "Abdulquadir Folorunso Adeshina",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      },
      "BLT-2026-022": {
        name: "Auwal Yahaya",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      },
      "BLT-2026-023": {
        name: "Abdullahi Yusuf Umar",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      },
      "BLT-2026-024": {
        name: "Fasilat Olopade Olawunmi",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      },
      "BLT-2026-025": {
        name: "Kareem Saheed Adeniyi",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      },
      "BLT-2026-026": {
        name: "Salihu Adamu Deba",
        course: "Smart Home Automation & CCTV Master Class",
        issueDate: "June 17, 2026",
        partner: "None",
        status: "Valid"
      }
    };

    function getPartnerByCertId(certId) {
      if (!certId) return "Hamjik Care Initiative";
      const match = certId.match(/(\d+)$/);
      if (!match) return "Hamjik Care Initiative";
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 4) return "Nurtureroots Foundation";
      if (num >= 5 && num <= 17) return "Nasscomsoft";
      if (num >= 18 && num <= 26) return "None";
      if (num >= 27 && num <= 67) return "Hamjik Care Initiative";
      return "Hamjik Care Initiative";
    }

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
      // Ensure partner field is attached
      if (!result.partner) {
        result.partner = getPartnerByCertId(searchId);
      }
      return res.status(200).json({ success: true, data: { id: searchId, ...result } });
    } else {
      // Certificate not found
      return res.status(404).json({ success: false, error: "Invalid or unrecognized certificate number." });
    }

  } catch (err) {
    return res.status(500).json({ error: "Server error occurred." });
  }
};