const User = require('../models/User');

/**
 * Service handling authentication operations.
 */
class AuthService {
  /**
   * Register a new user (STUDENT or FACULTY)
   */
  static async registerUser({ name, email, password, role = 'STUDENT', department = '' }) {
    // Standardize role to uppercase
    const normalizedRole = (role || 'STUDENT').toUpperCase();

    // Security requirement: Block ADMIN registration from public endpoint
    if (normalizedRole === 'ADMIN') {
      const error = new Error('Public registration for ADMIN role is strictly prohibited.');
      error.statusCode = 403;
      throw error;
    }

    if (!['STUDENT', 'FACULTY'].includes(normalizedRole)) {
      const error = new Error('Role must be either STUDENT or FACULTY.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      department: department ? department.trim() : ''
    });

    return user;
  }

  /**
   * Authenticate user with email and password
   */
  static async loginUser({ email, password }) {
    if (!email || !password) {
      const error = new Error('Please provide email and password.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user with password field included
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Check active status
    if (!user.isActive) {
      const error = new Error('Your account is deactivated. Please contact administrator.');
      error.statusCode = 403;
      throw error;
    }

    return user;
  }

  /**
   * Change authenticated user's password
   */
  static async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      const error = new Error('Please provide both current and new passwords.');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error('New password must be at least 6 characters long.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect.');
      error.statusCode = 400;
      throw error;
    }

    // Update password (triggers pre-save bcrypt hash hook)
    user.password = newPassword;
    await user.save();

    return true;
  }
}

module.exports = AuthService;
