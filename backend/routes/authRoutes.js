// ============================================
// AUTHENTICATION ROUTES (MVC Pattern - Routes Layer)
// Defines HTTP endpoints for user authentication
// Base path: /api/auth (mounted in server.js)
// ============================================

import express from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// Anyone can register or login
// ============================================
router.post('/register', register);  // POST /api/auth/register - Create new user account
router.post('/login', login);        // POST /api/auth/login - Authenticate & get JWT token

// ============================================
// PROTECTED ROUTES (Authentication required)
// Must include valid JWT token in Authorization header
// ============================================
router.get('/profile', authenticate, getProfile);      // GET /api/auth/profile - Get current user's profile
router.put('/profile', authenticate, updateProfile);   // PUT /api/auth/profile - Update current user's profile

export default router;