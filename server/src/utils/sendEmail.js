import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,      // 👈 CHANGE THIS from 587
  secure: true,   // 👈 CHANGE THIS to true (Required for port 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Add these timeouts to prevent infinite hanging
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,   // 10 seconds
});

const sendEmail = async (to, subject, html) => {
  try {
    console.log(`📨 Connecting to Gmail (Port 465) for: ${to}`);

    const info = await transporter.sendMail({
      from: `"CogitoSphere Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent! ID:", info.messageId);
    return info;

  } catch (err) {
    console.error("❌ Email Failed:", err);
    throw err;
  }
};

export default sendEmail;