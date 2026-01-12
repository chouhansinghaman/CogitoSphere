import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    // Log intent (helps debugging)
    console.log(`📨 Attempting to send email to: ${to}`);

    const info = await transporter.sendMail({
      from: `"CogitoSphere Team" <${process.env.EMAIL_USER}>`, // Updated name!
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully ID:", info.messageId);
    return info;

  } catch (err) {
    // CRITICAL: Log the actual error from Google
    console.error("❌ Nodemailer Error:", err); 
    throw err; 
  }
};

export default sendEmail;