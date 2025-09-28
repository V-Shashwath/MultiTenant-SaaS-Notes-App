import express from 'express';
import { createNote, getNotes, getNote, updateNote, deleteNote } from '../controllers/notes.js';
import { authenticateToken, requireMemberOrAdmin, enforceTenantIsolation } from '../middleware/auth.js';

const router = express.Router();

// All notes routes require authentication and member+ role
router.use(authenticateToken);
router.use(requireMemberOrAdmin);
router.use(enforceTenantIsolation);

// Notes CRUD routes
router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;