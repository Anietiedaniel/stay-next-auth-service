import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const isProduction = process.env.NODE_ENV === "production";

// ========== ADMIN EMAIL LOGIN ==========
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Admin not found" });

    if (user.role !== "admin")
      return res.status(403).json({ message: "Access denied — not an admin" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = generateToken(user._id, user.role, user.email);
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Admin login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("🔥 Admin Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ========== ADMIN GOOGLE LOGIN ==========
export const adminGoogleLogin = async (req, res) => {
  try {
    const { token, adminKey } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });
    if (!adminKey || adminKey !== process.env.ADMIN_KEY)
      return res.status(401).json({ message: "Invalid admin key" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email, role: "admin" });
    if (!user)
      return res.status(404).json({ message: "No admin account for this email" });

    const jwtToken = generateToken(user._id, user.role, user.email);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Admin Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || picture,
      },
    });
  } catch (err) {
    console.error("🔥 Admin Google Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
