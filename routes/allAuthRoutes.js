import express from 'express';
import sharedAuthRoutes from './sharedAuthRoutes.js';
import adminAuthRoutes from './adminAuthRoutes.js';
import superAdminAuthRoutes from './superAdminAuthRoutes.js';
import internalRouter from './internal.js'
import grouter from './googleRoute.js'

const router = express.Router();

/* ---------------------- 🧩 Combined Auth Routes ---------------------- */
router.use('/', sharedAuthRoutes);
router.use('/internal', internalRouter);
router.use('/admin', adminAuthRoutes);
router.use('/superadmin', superAdminAuthRoutes);

router.use('/google', grouter);

export default router;
