// testResend.js
import { Resend } from "resend";
const resend = new Resend("re_3qnGXFvi_3A9FXB5JDwF9b7ymaL8HKGkd");

async function test() {
  try {
    const data = await resend.emails.send({
      from: "Stay Next <onboarding@resend.dev>",
      to: "anietienteabasi123@gmail.com",
      subject: "Test Resend Email",
      html: "<h1>Hello from Stay Next 👋</h1><p>This is a test email.</p>",
    });
    console.log("✅ Email sent:", data);
  } catch (e) {
    console.error("❌ Error:", e);
  }
}

test();
