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
const allowedOrigins = [
  "https://stay-next-frontend-production.up.railway.app",
  "https://stay-next-frontend.onrender.com",
  "http://localhost:5173",
  "https://stay-next-frontend.netlify.app", // example extra
  "https://stay-next-frontend.vercel.app",  // example extra
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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
app.get("/", (req, res) => {
  res.send("Auth Service is running 🚀");
});

export default app;
