// server.js (top)
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

// DEBUG: check env availability
console.log("Environment:", process.env.NODE_ENV);
console.log("MONGO_URI available?", !!process.env.MONGO_URI);
console.log("MONGO_URI (short):", process.env.MONGO_URI ? process.env.MONGO_URI.slice(0, 40) + "..." : "undefined");

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`✅ Auth service running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

startServer();
