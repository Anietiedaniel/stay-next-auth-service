import brevo from "@getbrevo/brevo";

const client = new brevo.TransactionalEmailsApi();
client.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const email = {
      sender: { email: "anietienteabasi123@mail.com", name: "Stay Next Real Estate" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };
    const response = await client.sendTransacEmail(email);
    console.log("✅ Email sent successfully:", response.messageId || "OK");
  } catch (error) {
    console.error("❌ Brevo email failed:", error.message);
  }
};
