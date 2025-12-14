// ============================================
// APPLICATION ROUTES (MVC Pattern - Routes Layer)
// Defines HTTP endpoints for job application management
// Base path: /api/applications (mounted in server.js)
// Separates job seeker and employer functionality
// ============================================

import express from 'express';
import {
  applyForJob,              // Job seeker submits application
  getMyApplications,        // Job seeker views their applications
  getJobApplications,       // Employer views applications for their job
  updateApplicationStatus,  // Employer updates application status
  deleteApplication         // Job seeker withdraws application
} from '../controllers/applicationController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// ============================================
// JOB SEEKER ROUTES
// Routes for candidates to manage their job applications
// Requires authentication AND jobseeker role
// ============================================
router.post('/', authenticate, authorize('jobseeker'), applyForJob);  
// POST /api/applications - Submit application for a job

router.get('/my-applications', authenticate, authorize('jobseeker'), getMyApplications);
// GET /api/applications/my-applications - View all my applications with status

router.delete('/:id', authenticate, authorize('jobseeker'), deleteApplication);
// DELETE /api/applications/:id - Withdraw/cancel an application

// ============================================
// EMPLOYER ROUTES
// Routes for employers to manage applications for their job postings
// Requires authentication AND employer role
// ============================================
router.get('/job/:jobId', authenticate, authorize('employer'), getJobApplications);
// GET /api/applications/job/:jobId - View all applications for a specific job

router.put('/:id', authenticate, authorize('employer'), updateApplicationStatus);
// PUT /api/applications/:id - Update application status (pending/reviewing/accepted/rejected)

export default router;