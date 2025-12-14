// ============================================
// USER CONTROLLER (MVC Pattern - Controller Layer)
// Handles user management operations (CRUD)
// Separate from auth controller for better organization
// ============================================

import User from '../models/User.js';

// ============================================
// GET ALL USERS
// @desc    Retrieve list of all active users
// @route   GET /api/users
// @access  Private (requires authentication)
// ============================================
export const getAllUsers = async (req, res) => {
  try {
    // Query parameters for filtering
    const { role, location, search, page = 1, limit = 20 } = req.query;
    
    // Build query object
    const query = { isActive: true };
    
    // Filter by role if provided
    if (role && ['jobseeker', 'employer'].includes(role)) {
      query.role = role;
    }
    
    // Filter by location if provided
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    
    // Fetch users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      },
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
};

// ============================================
// GET SINGLE USER BY ID
// @desc    Retrieve detailed information about a specific user
// @route   GET /api/users/:id
// @access  Private (requires authentication)
// ============================================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't show inactive users unless it's the user themselves
    if (!user.isActive && user._id.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
};

// ============================================
// CREATE NEW USER
// @desc    Create a new user (admin functionality)
// @route   POST /api/users
// @access  Private (requires authentication)
// ============================================
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, company, phone, location, bio, skills } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate employer requirements
    if (role === 'employer' && !company) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required for employers'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      company,
      phone,
      location,
      bio,
      skills
    });

    // Return user without password
    const userWithoutPassword = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Create user error:', error);
    
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
      message: 'Server error creating user'
    });
  }
};

// ============================================
// UPDATE USER
// @desc    Update user information
// @route   PUT /api/users/:id
// @access  Private (user can only update their own account or admin)
// ============================================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only update their own account (unless admin in future)
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own account'
      });
    }

    // Fields allowed to be updated
    const allowedUpdates = ['name', 'phone', 'location', 'bio', 'skills', 'company', 'resumeLink'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates. You cannot update email, password, or role through this endpoint.'
      });
    }

    // Apply updates
    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(id).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
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
      message: 'Server error updating user'
    });
  }
};

// ============================================
// DELETE USER (SOFT DELETE)
// @desc    Deactivate user account (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (user can only delete their own account or admin)
// ============================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only delete their own account (unless admin in future)
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own account'
      });
    }

    // Soft delete - just deactivate the account
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User account deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// ============================================
// PERMANENTLY DELETE USER
// @desc    Permanently remove user from database (admin only)
// @route   DELETE /api/users/:id/permanent
// @access  Private (admin only - future implementation)
// ============================================
export const permanentlyDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Users can only permanently delete their own account
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own account'
      });
    }

    // Permanently delete user
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User permanently deleted from database'
    });
  } catch (error) {
    console.error('Permanent delete user error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};
