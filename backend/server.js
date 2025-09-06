const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config(); // load .env
const app = express();
app.use(cors());
app.use(express.json());
// ================== Multer Setup ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save in uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
// File filter: only images
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};
// Multer instance with 5MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
// ================== Nodemailer Setup ==================
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // from .env
    pass: process.env.EMAIL_PASS, // from .env
  },
});

// ================== Route ==================
// ================== Route for Sending Only Text ==================
app.post("/send-text", async (req, res) => {
  try {
    const { from, to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, error: "Missing fields!" });
    }

    let mailOptions = {
      from,
      to,
      subject,
     html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 700px; margin: 0 auto; padding: 0; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #1e293b;">
  <h2 style="background: #ee4949; color: #fff; text-align: center; margin: 0; padding: 18px; border-radius: 10px 10px 0 0; font-weight: 700; font-size: 22px;">
    🔔 Important Alert
  </h2>
  <div style="padding: 20px; text-align:start;">
    <p style="color: #fff; font-size: 16px; font-weight: 600; margin-bottom: 20px;">
      ${message}
    </p>
  </div>
  <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.4); margin: 0;" />
  <p style="font-size: 13px; color: #fff; text-align: center; padding: 12px;">
    Sent with ❤️ securely via <strong>Cricket Fever</strong>
  </p>
</div>
`
    };
    let info = await transporter.sendMail(mailOptions);
    console.log("Text email sent:", info.response);

    res.json({ success: true, message: "Text email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

app.post("/send-email", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No image uploaded!" });
    }

    const { from, to, subject, message } = req.body;

    let mailOptions = {
      from,
      to,
      subject,
     html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 0; border: 1px solid #eee; border-radius: 10px; background: #fafafa; box-shadow: 0 4px 12px rgba(0,0,0,0.1);  background: #1e293b;">
<h2 style="background: #00a3ee; color: #fff; text-align: center; margin: 0; padding: 20px; border-radius: 10px 10px 0 0; font-weight: 700; font-size: 22px;">
    📩 You’ve Got a New Message
  </h2>
  <div style="padding: 25px; text-align:start;">
    <p style="color: #fff; font-size: 17px; font-weight: 600; margin-bottom: 25px;">
      ${message}
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <img src="cid:image1" style="max-width: 90%; height: auto; border-radius: 12px; box-shadow: 0 6px 15px rgba(0,0,0,0.2);" alt="Attached Image" />
    </div>
  </div>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 0;" />
  <p style="font-size: 14px; color: #fff; text-align: center; padding: 12px; font-weight: 500;">
    Sent with ❤️ via <strong>Cricket Fever</strong>
  </p>
</div>
`,
      attachments: [
        {
          filename: req.file.originalname,
          path: req.file.path,
          cid: "image1", // same cid as in html img src
        },
      ],
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    // Delete the uploaded file after sending
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting uploaded file:", err);
      else console.log("Uploaded file deleted successfully!");
    });

    res.json({ success: true, message: "Email sent with inline image!" });
  } catch (err) {
    console.error(err);
    // Delete uploaded file even on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
        else console.log("Uploaded file deleted successfully!");
      });
    }
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});


// ================== Start Server ==================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
