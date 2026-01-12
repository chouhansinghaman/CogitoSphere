import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, html) => {
  // --- DEBUGGING LOGS (Check your Render Logs for these lines!) ---
  console.log("🔍 DEBUG: Sender Email is:", process.env.EMAIL_USER || "MISSING!");
  console.log("🔍 DEBUG: API Key Status:", process.env.BREVO_API_KEY ? "Loaded (Starts with " + process.env.BREVO_API_KEY.substring(0, 5) + "...)" : "MISSING!");
  // -------------------------------------------------------------

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = { name: "CogitoSphere Team", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: to }];

  try {
    console.log(`🚀 Sending email via Brevo...`);
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully!', data);
    return data;
  } catch (error) {
    // This logs the REAL error from Brevo (401 = Bad Key, 400 = Bad Sender)
    console.error('❌ Brevo Error Full Details:', JSON.stringify(error, null, 2)); 
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;