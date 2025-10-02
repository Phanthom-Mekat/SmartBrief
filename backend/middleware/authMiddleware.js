const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes by verifying JWT token
 * Attaches user object to req.user if token is valid
 */
const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from 'Bearer <token>'
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database and attach to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user account is active
      if (req.user.isActive === false) {
        return res.status(403).json({ 
          message: 'Your account has been deactivated due to inactivity. Please contact support.' 
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Higher-order function to authorize users based on roles
 * @param {...string} roles - Allowed roles for the route
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is attached to request (protect middleware should run first)
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has sufficient credits
 * @param {number} requiredCredits - Minimum credits required
 * @returns {Function} Middleware function
 */
const checkCredits = (requiredCredits = 1) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.credits < requiredCredits) {
      return res.status(402).json({ 
        message: `Insufficient credits. Required: ${requiredCredits}, Available: ${req.user.credits}` 
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
  checkCredits
};