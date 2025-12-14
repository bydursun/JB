const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original name is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  summary: {
    type: String,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: [{
    company: { type: String, trim: true },
    position: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, maxlength: 500 }
  }],
  education: [{
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    graduationDate: { type: Date },
    gpa: { type: Number, min: 0, max: 4.0 }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
resumeSchema.index({ userId: 1 });

module.exports = mongoose.model('Resume', resumeSchema);