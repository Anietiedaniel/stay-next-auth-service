// app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/allAuthRoutes.js";

const __dirname = path.resolve();
const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());

// ===== CORS Setup =====
// Allow credentials + exact origin match
const allowedOrigin = "https://stay-next-frontend-production.up.railway.app";

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Added "PATCH" here
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===== API Routes =====
app.use("/api/auth", authRoutes);

import { sendEmail } from "./utils/sendEmail.js";
import { emailTemplate } from "./utils/emailTemplate.js";

app.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "ubongdavid230@gmail.com",
      subject: "Test from Stay Next",
      html: emailTemplate("verifyEmail", { name: "David", email: "anietienteabasi123@gmail.com" }, null, { verificationLink: "https://stay-next.com/verify" }),
    });
    res.send("✅ Email sent successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Test failed");
  }
});


// ===== Optional Frontend Serving =====
/* 
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
*/

// ===== Health check =====
app.get("/", (req, res) => {
  res.send("Auth Service is running 🚀");
});

export default app;
