import express from 'express';
import { upgradeTenant, getTenantInfo, getTenantStats } from '../controllers/tenants.js';
import { authenticateToken, requireAdmin, enforceTenantIsolation } from '../middleware/auth.js';

const router = express.Router();

// All tenant routes require authentication
router.use(authenticateToken);
router.use(enforceTenantIsolation);

// Tenant routes
router.get('/:slug', getTenantInfo);
router.post('/:slug/upgrade', requireAdmin, upgradeTenant);
router.get('/:slug/stats', requireAdmin, getTenantStats);

export default router;