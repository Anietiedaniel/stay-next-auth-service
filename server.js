import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB first, then start server
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
