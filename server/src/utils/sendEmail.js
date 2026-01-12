import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, html) => {
  // 1. Setup the client
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  // 2. Configure the email
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = { name: "CogitoSphere Team", email: process.env.EMAIL_USER };
  sendSmtpEmail.to = [{ email: to }];

  try {
    console.log(`🚀 Sending email via Brevo API to: ${to}`);
    
    // 3. Send via HTTP (Instant)
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log('✅ Email sent successfully! Message ID:', data.messageId);
    return data;
  } catch (error) {
    console.error('❌ Brevo Email Error:', error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;