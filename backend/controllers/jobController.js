// ============================================
// JOB CONTROLLER (MVC Pattern - Controller Layer)
// Handles all job posting CRUD operations
// Implements pagination, search, and filtering
// ============================================

import JobPosting from '../models/JobPosting.js';
import Application from '../models/Application.js';

// ============================================
// GET ALL JOB POSTINGS (READ OPERATION)
// @desc    Retrieve paginated list of active jobs with filters
// @route   GET /api/jobs?page=1&limit=10&search=developer&location=Toronto
// @access  Public (no authentication required)
// ============================================
const getJobs = async (req, res) => {
  try {
    // ============================================
    // PAGINATION SETUP
    // Parse page and limit from query string, provide defaults
    // ============================================
    const page = parseInt(req.query.page, 10) || 1;      // Default: page 1
    const limit = parseInt(req.query.limit, 10) || 10;   // Default: 10 jobs per page
    const startIndex = (page - 1) * limit;               // Calculate skip value

    // ============================================
    // BUILD QUERY OBJECT
    // Start with active jobs only, add filters based on query params
    // ============================================
    let query = { isActive: true }; // Only show active job postings

    // ============================================
    // SEARCH FUNCTIONALITY
    // Uses MongoDB text index for full-text search
    // Searches across title, description, and company fields
    // ============================================
    if (req.query.search) {
      query.$text = { $search: req.query.search };
      // Example: /api/jobs?search=developer
      // Finds jobs with "developer" in title/description/company
    }

    // ============================================
    // FILTER BY LOCATION
    // Case-insensitive partial match using regex
    // ============================================
    if (req.query.location) {
      query.location = new RegExp(req.query.location, 'i');
      // Example: /api/jobs?location=toronto
      // Matches "Toronto", "toronto", "Toronto, ON", etc.
    }

    // ============================================
    // FILTER BY JOB TYPE
    // Exact match for job type enum values
    // ============================================
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
      // Example: /api/jobs?jobType=full-time
      // Valid values: full-time, part-time, contract, internship
    }

    // ============================================
    // FILTER BY EXPERIENCE LEVEL
    // Exact match for experience enum values
    // ============================================
    if (req.query.experience) {
      query.experience = req.query.experience;
      // Example: /api/jobs?experience=mid
      // Valid values: entry, mid, senior, executive
    }

    // ============================================
    // EXECUTE DATABASE QUERY WITH OPTIMIZATIONS
    // ============================================
    const jobs = await JobPosting.find(query)
      .populate('createdBy', 'name company')     // Join with User collection, only return name & company
      .populate('applicationCount')              // Count applications using virtual field
      .sort({ createdAt: -1 })                  // Sort by newest first
      .limit(limit * 1)                         // Limit results per page
      .skip(startIndex)                         // Skip previous pages
      .exec();                                  // Execute query

    // ============================================
    // COUNT TOTAL DOCUMENTS FOR PAGINATION
    // Separate query to get total count (for calculating total pages)
    // ============================================
    const total = await JobPosting.countDocuments(query);

    // ============================================
    // BUILD PAGINATION METADATA
    // Provides frontend with information about available pages
    // ============================================
    const pagination = {
      currentPage: page,                        // Current page number
      totalPages: Math.ceil(total / limit),     // Total pages available
      totalJobs: total,                         // Total matching jobs
      hasNext: startIndex + limit < total,      // Are there more pages?
      hasPrev: page > 1                         // Is there a previous page?
    };

    // ============================================
    // SEND SUCCESSFUL RESPONSE
    // Consistent response structure for all API endpoints
    // ============================================
    res.json({
      success: true,           // Indicates successful operation
      count: jobs.length,      // Number of jobs in current page
      pagination,              // Pagination metadata
      data: { jobs }           // Actual job data
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching jobs'
    });
  }
};

// @desc    Get single job posting
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id)
      .populate('createdBy', 'name company email phone')
      .populate('applicationCount');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error fetching job'
    });
  }
};

// ============================================
// CREATE NEW JOB POSTING (CREATE OPERATION)
// @desc    Employer creates new job listing
// @route   POST /api/jobs
// @access  Private - Employer only
// ============================================
const createJob = async (req, res) => {
  try {
    // ============================================
    // PREPARE JOB DATA
    // Merge request body with authenticated user data
    // ============================================
    const jobData = {
      ...req.body,                              // All job details from request
      createdBy: req.user.id,                   // Set job owner to authenticated user
      company: req.user.company || req.body.company  // Use employer's company or provided company
    };

    // ============================================
    // CREATE JOB IN DATABASE
    // Mongoose will validate all required fields and data types
    // ============================================
    const job = await JobPosting.create(jobData);
    
    // ============================================
    // POPULATE CREATOR INFORMATION
    // Fetch employer details to return complete job object
    // ============================================
    await job.populate('createdBy', 'name company email');

    res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    
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
      message: 'Server error creating job posting'
    });
  }
};

// ============================================
// UPDATE JOB POSTING (UPDATE OPERATION)
// @desc    Update existing job listing
// @route   PUT /api/jobs/:id
// @access  Private - Job creator only (authorization check)
// ============================================
const updateJob = async (req, res) => {
  try {
    // ============================================
    // STEP 1: VERIFY JOB EXISTS
    // ============================================
    let job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // ============================================
    // STEP 2: VERIFY OWNERSHIP
    // Only the employer who created the job can update it
    // Prevents unauthorized modifications
    // ============================================
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job posting'
      });
    }

    job = await JobPosting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name company email');

    res.json({
      success: true,
      message: 'Job posting updated successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Update job error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
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
      message: 'Server error updating job posting'
    });
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Job creator only)
const deleteJob = async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check if user is the creator
    if (job.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job posting'
      });
    }

    // Delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });

    // Delete the job
    await JobPosting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job posting deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error deleting job posting'
    });
  }
};

// @desc    Get jobs created by current user (employer)
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer only)
const getMyJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const jobs = await JobPosting.find({ createdBy: req.user.id })
      .populate('applicationCount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(startIndex)
      .exec();

    const total = await JobPosting.countDocuments({ createdBy: req.user.id });

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalJobs: total,
      hasNext: startIndex + limit < total,
      hasPrev: page > 1
    };

    res.json({
      success: true,
      count: jobs.length,
      pagination,
      data: { jobs }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching your jobs'
    });
  }
};

export {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
};