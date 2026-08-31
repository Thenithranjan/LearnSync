const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware to authenticate requests via JWT cookie or Authorization header.
 */
const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies ? req.cookies.token : null;

    // Fallback to Bearer token in Authorization header if present
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Authentication required. Please log in.');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');

    // Find user by ID
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'User account no longer exists.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'User account is inactive. Please contact administrator.');
    }

    // Attach user to req object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid authentication token.');
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Authentication token has expired. Please log in again.');
    }
    return sendError(res, 401, 'Authentication failed.');
  }
};

/**
 * Middleware for role-based authorization.
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'FACULTY')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role: [${roles.join(', ')}]. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
