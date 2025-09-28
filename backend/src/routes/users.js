
// routes/users.js
import express from 'express';
import { inviteUser, getTenantUsers, updateUserRole, removeUser } from '../controllers/users.js';
import { authenticateToken, requireAdmin, enforceTenantIsolation } from '../middleware/auth.js';

const router = express.Router();

// All user management routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);
router.use(enforceTenantIsolation);

// User management routes (Admin only)
router.post('/invite', inviteUser);
router.get('/', getTenantUsers);
router.put('/:userId/role', updateUserRole);
router.delete('/:userId', removeUser);

export default router;