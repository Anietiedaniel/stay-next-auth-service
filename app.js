import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/allAuthRoutes.js";

dotenv.config();

const __dirname = path.resolve();
const app = express();

app.use(express.json());
app.use(cookieParser());

// ✅ Environment check
const isDev = process.env.NODE_ENV === "development";
console.log(`🌍 Running in ${isDev ? "Development" : "Production"} mode`);

// ✅ CORS Setup
if (isDev) {
  // 🧩 Allow all origins for local testing
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.options(/.*/, cors());
  console.log("⚙️  Dev CORS: All origins allowed");
} else {
  // 🔒 Production CORS (restricted)
  const corsOptions = {
    origin: (origin, callback) => {
      const allowedOrigins =
        process.env.CLIENT_URL?.split(",").map((o) => o.trim()) || [];
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  console.log("🔒 Prod CORS: Restricted origins enabled");
}

// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Health check
app.get("/", (req, res) =>
  res.send(
    isDev
      ? "🚧 Auth Service running in DEVELOPMENT mode"
      : "🚀 Auth Service running in PRODUCTION mode"
  )
);

export default app;
