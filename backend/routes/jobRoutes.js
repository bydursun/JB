// ============================================
// JOB POSTING ROUTES (MVC Pattern - Routes Layer)
// Defines HTTP endpoints for job posting CRUD operations
// Base path: /api/jobs (mounted in server.js)
// ============================================

import express from 'express';
import {
  getJobs,    // List all jobs with filters
  getJob,     // Get single job details
  createJob,  // Create new job posting
  updateJob,  // Update existing job
  deleteJob,  // Delete job posting
  getMyJobs   // Get employer's own jobs
} from '../controllers/jobController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// Anyone can browse and view job postings
// ============================================
router.get('/', getJobs);      // GET /api/jobs - List all jobs (supports pagination, search, filters)
router.get('/employer/my-jobs', authenticate, authorize('employer'), getMyJobs); // GET /api/jobs/employer/my-jobs - Get employer's jobs
router.get('/:id', getJob);    // GET /api/jobs/:id - Get single job by ID

// ============================================
// PROTECTED ROUTES (Employer only)
// Requires authentication AND employer role
// Uses authenticate middleware to verify JWT, then authorize to check role
// ============================================
router.post('/', authenticate, authorize('employer'), createJob);       // POST /api/jobs - Create new job posting
router.put('/:id', authenticate, authorize('employer'), updateJob);     // PUT /api/jobs/:id - Update job posting
router.delete('/:id', authenticate, authorize('employer'), deleteJob);  // DELETE /api/jobs/:id - Delete job posting

export default router;
