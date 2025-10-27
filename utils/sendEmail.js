import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    await transporter.sendMail({
      from: `"Stay Next" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

export {sendEmail};
