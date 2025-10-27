import brevo from "@getbrevo/brevo";

const client = new brevo.TransactionalEmailsApi();
client.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const email = {
      sender: {
        name: "Stay Next Real Estate",
        email: "anietienteabasi123@mail.com", // must be verified in Brevo
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    const response = await client.sendTransacEmail(email);
    console.log("✅ Email sent successfully:", response);
  } catch (error) {
    console.error("❌ Brevo email failed:", error.response?.body || error.message);
  }
};
