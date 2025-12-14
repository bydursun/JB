// ============================================
// APPLICATION MODEL (MVC Pattern - Model Layer)
// Manages job applications submitted by job seekers
// Links Users to JobPostings with application status tracking
// ============================================

import mongoose from 'mongoose';

// ============================================
// APPLICATION SCHEMA DEFINITION
// Represents the relationship between a user and a job posting
// ============================================
const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPosting',
    required: [true, 'Job ID is required']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'accepted'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot exceed 1000 characters']
  },
  resumeUrl: {
    type: String
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// ============================================
// COMPOUND UNIQUE INDEX - PREVENTS DUPLICATE APPLICATIONS
// Database-level constraint ensures a user can only apply once per job
// More reliable than application-level checking
// ============================================
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// ============================================
// PERFORMANCE INDEXES
// Speed up common queries for applications
// ============================================
applicationSchema.index({ userId: 1 });      // Get all applications by a user
applicationSchema.index({ jobId: 1 });       // Get all applications for a job
applicationSchema.index({ status: 1 });      // Filter by application status
applicationSchema.index({ createdAt: -1 });  // Sort by application date

// ============================================
// PRE-SAVE MIDDLEWARE - AUTO-SET REVIEW TIMESTAMP
// Automatically timestamp when application status changes from pending
// ============================================
applicationSchema.pre('save', function(next) {
  // Check if status field was modified and is no longer 'pending'
  if (this.isModified('status') && this.status !== 'pending') {
    this.reviewedAt = new Date(); // Set review timestamp
  }
  next(); // Continue with save operation
});

export default mongoose.model('Application', applicationSchema);