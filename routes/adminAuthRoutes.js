import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { adminLogin, adminGoogleLogin } from '../controllers/adminAuthController.js';
import { loginSchema } from '../validators/authSchema.js';

const router = express.Router();

/* ---------------------- 👑 Admin Authentication Routes ---------------------- */

router.post('/login', validate(loginSchema), adminLogin);

router.post('/google', adminGoogleLogin);

export default router;
