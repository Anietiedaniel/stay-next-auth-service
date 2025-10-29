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

// ===== Optional Frontend Serving =====
/* 
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
*/

// ===== Health check =====
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
});

export default app;
