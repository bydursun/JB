// ============================================
// AUTHENTICATION MIDDLEWARE
// Protects routes by verifying JWT tokens
// Implements Bearer Token Authentication
// ============================================

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ============================================
// AUTHENTICATE FUNCTION
// Middleware to verify user identity via JWT token
// Used on protected routes that require login
// ============================================
const authenticate = async (req, res, next) => {
  try {
    let token;

    // ============================================
    // STEP 1: EXTRACT TOKEN FROM AUTHORIZATION HEADER
    // Expected format: "Authorization: Bearer <token>"
    // ============================================
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Split "Bearer <token>" and take the token part
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, deny access
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // ============================================
    // STEP 2: VERIFY TOKEN SIGNATURE & EXPIRATION
    // jwt.verify throws error if token is invalid or expired
    // ============================================
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contains: { id: userId, iat: issuedAt, exp: expiresAt }
    
    // ============================================
    // STEP 3: FETCH USER FROM DATABASE
    // Verify user still exists and get current user data
    // ============================================
    const user = await User.findById(decoded.id).select('-password');
    // .select('-password') excludes password from returned user object
    
    // User not found (maybe deleted after token was issued)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }

    // ============================================
    // STEP 4: CHECK IF ACCOUNT IS ACTIVE
    // Prevent deactivated accounts from accessing protected routes
    // ============================================
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // ============================================
    // STEP 5: ATTACH USER TO REQUEST OBJECT
    // Makes user data available to subsequent middleware/controllers
    // Controller can access via req.user
    // ============================================
    req.user = user;
    next(); // Pass control to next middleware/route handler
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// ============================================
// ROLE-BASED AUTHORIZATION MIDDLEWARE
// Restricts route access based on user role (jobseeker/employer)
// Must be used AFTER authenticate middleware
// ============================================
const authorize = (...roles) => {
  // Returns a middleware function (closure pattern)
  // This allows us to pass role parameters: authorize('employer', 'admin')
  return (req, res, next) => {
    // Check if user's role is in the allowed roles array
    // req.user is set by authenticate middleware
    if (!roles.includes(req.user.role)) {
      // 403 Forbidden - user is authenticated but doesn't have permission
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next(); // User has required role, proceed to route handler
  };
};

export { authenticate, authorize };