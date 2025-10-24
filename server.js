// 1️⃣ Load dotenv first (always at the very top)
import 'dotenv/config'; // handles process.env automatically

// 2️⃣ Other imports
import app from './app.js';
import connectDB from './config/db.js';

// 3️⃣ Port
const PORT = process.env.PORT || 5000;

// 4️⃣ Start server only after MongoDB connection
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Auth service running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
