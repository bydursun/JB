// ============================================
// USER ROUTES (MVC Pattern - Routes Layer)
// Defines HTTP endpoints for user management
// Base path: /api/users (mounted in server.js)
// ============================================

import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  permanentlyDeleteUser
} from '../controllers/userController.js';

const router = express.Router();

// ============================================
// USER CRUD ROUTES
// All routes require authentication
// ============================================

// GET /api/users - Get all users with filtering and pagination
router.get('/', authenticate, getAllUsers);

// GET /api/users/:id - Get single user by ID
router.get('/:id', authenticate, getUserById);

// POST /api/users - Create new user
router.post('/', authenticate, createUser);

// PUT /api/users/:id - Update user information
router.put('/:id', authenticate, updateUser);

// DELETE /api/users/:id - Soft delete user (deactivate account)
router.delete('/:id', authenticate, deleteUser);

// DELETE /api/users/:id/permanent - Permanently delete user from database
router.delete('/:id/permanent', authenticate, permanentlyDeleteUser);

export default router;