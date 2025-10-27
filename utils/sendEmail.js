// utils/sendEmail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 * @param {{to: string, subject: string, html: string}} param0
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const res = await resend.emails.send({
      from: "StayNext <noreply@resend.dev>", // change after domain verify
      to,
      subject,
      html,
    });
    console.log("✅ Resend email sent:", res.id);
    return res;
  } catch (err) {
    console.error("🔥 Resend sendEmail error:", err?.message || err);
    throw err;
  }
};
