// server.js
import "dotenv/config"; // Automatically loads .env
import app from "./app.js";
import connectDB from "./config/db.js";

// ===== Connect to MongoDB =====
connectDB();

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV}`);
  console.log(`Frontend URL: ${process.env.CLIENT_URL}`);
});
