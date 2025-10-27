import nodemailer from 'nodemailer';

// ⚠️ Make sure EMAIL_USER & EMAIL_PASS are set in .env
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️ EMAIL_USER or EMAIL_PASS not defined in env");
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Stay Next Real Estate" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✉️ Email sent to ${to}`);
  } catch (err) {
    console.error("🔥 sendEmail error:", err);
    throw err;
  }
};
