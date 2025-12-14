// ============================================
// JOB POSTING MODEL (MVC Pattern - Model Layer)
// Defines the schema for job listings created by employers
// Implements full CRUD operations for job management
// ============================================

import mongoose from 'mongoose';

// ============================================
// JOB POSTING SCHEMA DEFINITION
// Stores all job-related information with validation
// ============================================
const jobPostingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: [true, 'Job type is required'],
    default: 'full-time'
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: [true, 'Experience level is required'],
    default: 'entry'
  },
  salary: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative']
    },
    max: {
      type: Number,
      min: [0, 'Maximum salary cannot be negative']
    }
  },
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  applicationDeadline: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// DATABASE INDEXES FOR PERFORMANCE OPTIMIZATION
// Indexes speed up queries but use memory - only index frequently queried fields
// ============================================

// Text index for full-text search across title, description, and company
// Enables search functionality: db.jobs.find({ $text: { $search: "developer" } })
jobPostingSchema.index({ title: 'text', description: 'text', company: 'text' });

// Index on createdBy for fast filtering of jobs by employer
jobPostingSchema.index({ createdBy: 1 });

// Index on isActive for filtering active/inactive jobs
jobPostingSchema.index({ isActive: 1 });

// Index on createdAt for sorting by date (descending)
jobPostingSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL FIELDS (Computed Properties)
// These fields don't exist in database but are computed on-the-fly
// ============================================

// Virtual field to count applications for this job
// Uses Mongoose populate to count related Application documents
jobPostingSchema.virtual('applicationCount', {
  ref: 'Application',      // Reference Application model
  localField: '_id',       // Job's _id field
  foreignField: 'jobId',   // Application's jobId field
  count: true              // Return count instead of documents
});

// Virtual getter to check if application deadline has passed
// Returns true if deadline exists and is in the past
jobPostingSchema.virtual('isExpired').get(function() {
  return this.applicationDeadline && this.applicationDeadline < new Date();
});

export default mongoose.model('JobPosting', jobPostingSchema);