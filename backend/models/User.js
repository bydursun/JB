// ============================================
// USER MODEL (MVC Pattern - Model Layer)
// Defines the User schema for MongoDB
// Handles both Job Seekers and Employers
// ============================================

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // For password hashing

// ============================================
// USER SCHEMA DEFINITION
// Defines structure, validation, and constraints for User documents
// ============================================
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer'],
    required: [true, 'Role is required'],
    default: 'jobseeker'
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true,
    required: function() { return this.role === 'employer'; }
  },
  location: {
    type: String,
    trim: true
  },
  resumeLink: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// PRE-SAVE MIDDLEWARE - PASSWORD HASHING
// Automatically hash password before saving to database
// This is a Mongoose middleware (hook) that runs before .save()
// ============================================
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  // This prevents re-hashing when updating other fields
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt with 12 rounds (higher = more secure but slower)
    // Salt ensures same password = different hash for each user
    const salt = await bcrypt.genSalt(12);
    
    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Continue with save operation
  } catch (error) {
    next(error); // Pass error to error handler
  }
});

// ============================================
// INSTANCE METHOD - PASSWORD COMPARISON
// Compare plain text password with hashed password
// Used during login to verify credentials
// ============================================
userSchema.methods.comparePassword = async function(candidatePassword) {
  // bcrypt.compare handles the hashing and comparison securely
  // Returns true if passwords match, false otherwise
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for job postings (if employer)
userSchema.virtual('jobPostings', {
  ref: 'JobPosting',
  localField: '_id',
  foreignField: 'createdBy'
});

// Virtual for applications (if jobseeker)
userSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'userId'
});

export default mongoose.model('User', userSchema);