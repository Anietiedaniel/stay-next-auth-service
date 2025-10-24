import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/allAuthRoutes.js";

const __dirname = path.resolve();
const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Allow frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// ===== API Route =====
app.use("/api/auth", authRoutes);

/* 
// ===== Serve frontend (DISABLED for backend-only deployment) =====
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));

// ===== React Router fallback =====
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  } else {
    next();
  }
});
*/

// ✅ Health check route (optional, helps Render verify service is up)
app.get("/", (req, res) => {
  res.send("Auth Service is running 🚀");
});

export default app;
