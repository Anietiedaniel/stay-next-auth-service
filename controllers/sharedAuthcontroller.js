import User from '../models/User.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../utils/sendEmail.js';
import { emailTemplate } from '../utils/emailTemplates.js';
import { generateToken } from '../utils/jwt.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const isProduction = process.env.NODE_ENV === 'production';

// =============================================
// REGISTER (Default role = "visitor") + Email Verification
// =============================================
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "visitor",
      isGoogleUser: false,
      isNewUser: true,
      isVerified: false,
    });

    // 🔑 Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    user.verifyEmailToken = hashedToken;
    user.verifyEmailExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // ✉️ Fire-and-forget email (non-blocking)
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: emailTemplate("verifyEmail", user, null, { verificationLink }),
    }).catch(err => console.error("Email send failed:", err?.message));

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isNewUser: user.isNewUser,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("🔥 Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// VERIFY EMAIL
// =============================================
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Invalid or missing token" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verifyEmailToken: hashedToken,
      verifyEmailExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token invalid or expired" });

    user.isVerified = true;
    user.verifyEmailToken = undefined;
    user.verifyEmailExpire = undefined;
    await user.save();

    const tempToken = generateToken(user);
    res.cookie("token", tempToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 5 * 60 * 1000,
    });

    res.status(200).json({
      message: "Email verified successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error("🔥 Verify email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// LOGIN
// =============================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email before logging in" });

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isNewUser: false,
      },
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// GOOGLE LOGIN
// =============================================
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token missing" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      const hashed = await bcrypt.hash(sub + "_google", 10);
      user = await User.create({
        name,
        email,
        password: hashed,
        profileImage: picture,
        role: "visitor",
        isGoogleUser: true,
        isNewUser: true,
      });
    }

    const jwtToken = generateToken(user);
    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    console.error("🔥 Google Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// LOGOUT
// =============================================
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// =============================================
// GET ME
// =============================================
export const getMe = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecret");
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error("🔥 getMe error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// =============================================
// FORGOT PASSWORD
// =============================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashed;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // 🔥 Non-blocking email
    sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: emailTemplate("resetPassword", user, null, { resetLink }),
    }).catch(err => console.error("Reset email failed:", err?.message));

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("🔥 Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// RESET PASSWORD
// =============================================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Token invalid or expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("🔥 Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================
// SET ROLE
// =============================================
export const setRole = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { role } = req.body;

    if (!role) return res.status(400).json({ message: "Role is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isNewUser)
      return res.status(400).json({ message: "Role has already been set" });

    user.role = role;
    user.isNewUser = false;
    await user.save();

    res.status(200).json({
      message: "Role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isNewUser: user.isNewUser,
      },
    });
  } catch (err) {
    console.error("Error setting role:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
