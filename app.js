import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import authRoutes from "./routes/allAuthRoutes.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());

// ===== Dynamic CORS Setup =====
// Example .env value:
// CLIENT_URLS=http://localhost:5173,https://stay-next-frontend-production.up.railway.app,https://stay-next-frontend.onrender.com
const allowedOrigins = process.env.CLIENT_URLS?.split(",").map(url => url.trim()) || [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., Postman, same-server calls)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`❌ CORS blocked: ${origin}`);
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ====== Force overwrite headers if Render duplicates them ======
app.use((req, res, next) => {
  res.removeHeader("Access-Control-Allow-Origin");
  next();
});

// ===== API Routes =====
app.use("/api/auth", authRoutes);

// ===== Optional Frontend Serving =====
// (uncomment only if serving frontend from same backend)
 /*
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
*/

// ===== Health Check =====
app.get("/", (req, res) => {
  res.send("Auth Service is running 🚀");
});

export default app;
