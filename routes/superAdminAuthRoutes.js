import express from 'express';
import { isSuperAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  superAdminLogin,
  superAdminGoogleLogin,
} from '../controllers/superAdminAuthController.js';
import { loginSchema } from '../validators/authSchema.js';

const router = express.Router();

/* ---------------------- 🦸 Super Admin Authentication Routes ---------------------- */
router.post('/login', validate(loginSchema), isSuperAdmin, superAdminLogin);
router.post('/google', isSuperAdmin, superAdminGoogleLogin);

export default router;
