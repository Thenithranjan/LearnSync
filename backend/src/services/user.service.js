const User = require('../models/User');

/**
 * Service handling profile management operations.
 */
class UserService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  /**
   * Update profile fields (name, department, profileImage)
   * Note: Role, isActive, and password changes are explicitly prohibited here.
   */
  static async updateProfile(userId, { name, department, profileImage }) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (name !== undefined) user.name = name.trim();
    if (department !== undefined) user.department = department.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    return user;
  }
}

module.exports = UserService;
