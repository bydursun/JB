// ============================================
// AUTHENTICATION CONTROLLER (MVC Pattern - Controller Layer)
// Handles user registration, login, and profile management
// Implements JWT-based authentication
// ============================================

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ============================================
// JWT TOKEN GENERATOR HELPER FUNCTION
// Creates signed JSON Web Token for authenticated users
// Token is sent to client and used for subsequent API requests
// ============================================
const generateToken = (id) => {
  return jwt.sign(
    { id },                                      // Payload: user ID
    process.env.JWT_SECRET,                      // Secret key for signing
    { expiresIn: process.env.JWT_EXPIRE || '30d' } // Token validity period
  );
  // Token structure: header.payload.signature
  // Client stores this and sends in Authorization header
};

// ============================================
// REGISTER NEW USER
// @desc    Register a new user (job seeker or employer)
// @route   POST /api/auth/register
// @access  Public (no authentication required)
// ============================================
const register = async (req, res) => {
  try {
    // Extract registration data from request body
    const { name, email, password, role, company, phone, location } = req.body;

    // ============================================
    // STEP 1: CHECK FOR DUPLICATE EMAIL
    // Prevent multiple accounts with same email
    // ============================================
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // ============================================
    // STEP 2: ROLE-SPECIFIC VALIDATION
    // Employers must provide company name
    // ============================================
    if (role === 'employer' && !company) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required for employers'
      });
    }

    // ============================================
    // STEP 3: CREATE USER IN DATABASE
    // Password will be automatically hashed by User model's pre-save hook
    // ============================================
    const user = await User.create({
      name,
      email: email.toLowerCase(), // Normalize email to lowercase
      password,                    // Will be hashed before saving
      role,
      company,
      phone,
      location
    });

    // ============================================
    // STEP 4: GENERATE JWT TOKEN
    // User is automatically logged in after registration
    // ============================================
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          location: user.location
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
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
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          location: user.location
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'location', 'bio', 'skills', 'company', 'resumeLink'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
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
      message: 'Server error updating profile'
    });
  }
};

export {
  register,
  login,
  getProfile,
  updateProfile
};