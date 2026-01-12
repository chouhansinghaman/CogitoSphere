import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", // 👈 This replaces host/port/secure settings
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    console.log(`📨 Sending via Gmail Service to: ${to}`);

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