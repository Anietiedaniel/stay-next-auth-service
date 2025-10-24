import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

import {
  register,
  googleLogin,
  setRole,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  verifyEmail,
} from '../controllers/sharedAuthcontroller.js';

import {
  registerSchema,
  loginSchema,
  resetSchema,
  forgotSchema,
} from '../validators/authSchema.js';

const router = express.Router();

/* ---------------------- 🔐 Shared User Authentication Routes ---------------------- */
router.post('/register', validate(registerSchema), register);
router.get('/verify-email', verifyEmail);
router.post('/google', googleLogin);
router.patch('/set-role', protect, setRole);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/getMe', protect, getMe);

/* ---------------------- 🔑 Password Reset Routes ---------------------- */
router.post('/forgot-password', validate(forgotSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetSchema), resetPassword);

export default router;
