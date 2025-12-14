// ============================================
// APPLICATION CONTROLLER (MVC Pattern - Controller Layer)
// Manages job applications - linking job seekers to job postings
// Implements application workflow: submit, track, update status
// ============================================

import Application from '../models/Application.js';
import JobPosting from '../models/JobPosting.js';
import User from '../models/User.js';

// ============================================
// SUBMIT JOB APPLICATION (CREATE OPERATION)
// @desc    Job seeker applies for a job posting
// @route   POST /api/applications
// @access  Private - Job Seeker only (requires authentication + authorization)
// ============================================
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeUrl } = req.body;

    // ============================================
    // STEP 1: VALIDATE JOB EXISTS AND IS ACTIVE
    // Prevent applications to non-existent or closed jobs
    // ============================================
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check if job posting is still accepting applications
    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This job posting is no longer active'
      });
    }

    // ============================================
    // STEP 2: CHECK APPLICATION DEADLINE
    // Prevent late applications after deadline
    // ============================================
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // ============================================
    // STEP 3: PREVENT DUPLICATE APPLICATIONS
    // User can only apply once per job
    // ============================================
    const existingApplication = await Application.findOne({
      userId: req.user.id,  // Current authenticated user
      jobId: jobId          // Job they're applying to
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // ============================================
    // STEP 4: CREATE APPLICATION RECORD
    // Save application to database with 'pending' status
    // ============================================
    const application = await Application.create({
      userId: req.user.id,                       // Authenticated user's ID
      jobId,                                     // Job they're applying to
      coverLetter,                               // Optional cover letter
      resumeUrl: resumeUrl || req.user.resumeLink // Use provided URL or user's profile resume
    });

    // Populate the application
    await application.populate([
      { path: 'userId', select: 'name email' },
      { path: 'jobId', select: 'title company' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error submitting application'
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private (Job seeker only)
const getMyApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    let query = { userId: req.user.id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('jobId', 'title company location jobType salary createdAt')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex)
      .exec();

    const total = await Application.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
      hasNext: startIndex + limit < total,
      hasPrev: page > 1
    };

    res.json({
      success: true,
      count: applications.length,
      pagination,
      data: { applications }
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications'
    });
  }
};

// @desc    Get applications for a specific job (employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Check if job exists and belongs to the user
    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    let query = { jobId };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const applications = await Application.find(query)
      .populate('userId', 'name email phone location resumeLink skills')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex)
      .exec();

    const total = await Application.countDocuments(query);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalApplications: total,
      hasNext: startIndex + limit < total,
      hasPrev: page > 1
    };

    // Get application stats
    const stats = await Application.aggregate([
      { $match: { jobId: job._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      count: applications.length,
      pagination,
      stats,
      data: { 
        job: {
          id: job._id,
          title: job.title,
          company: job.company
        },
        applications 
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error fetching job applications'
    });
  }
};

// @desc    Update application status (employer)
// @route   PUT /api/applications/:id
// @access  Private (Employer only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const application = await Application.findById(req.params.id)
      .populate('jobId', 'createdBy title company');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the job posting
    if (application.jobId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update application
    application.status = status;
    application.notes = notes;
    application.reviewedBy = req.user.id;
    await application.save();

    // Populate the updated application
    await application.populate([
      { path: 'userId', select: 'name email' },
      { path: 'reviewedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error updating application status'
    });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Application owner only)
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error deleting application'
    });
  }
};

export {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication
};