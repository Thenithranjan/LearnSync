const UserService = require('../services/user.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Controller for User profile management endpoints.
 */
class UserController {
  /**
   * GET /api/users/profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user._id);
      return sendSuccess(res, 200, 'Profile retrieved successfully', {
        user: user.toAuthJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, department, profileImage } = req.body;
      const updatedUser = await UserService.updateProfile(req.user._id, {
        name,
        department,
        profileImage
      });

      return sendSuccess(res, 200, 'Profile updated successfully', {
        user: updatedUser.toAuthJSON()
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
