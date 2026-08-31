const AuthService = require('../services/auth.service');
const { generateTokenAndSetCookie, clearAuthCookie } = require('../utils/generateToken');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Controller for Auth endpoints.
 */
class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, role, department } = req.body;
      const user = await AuthService.registerUser({ name, email, password, role, department });

      // Generate JWT and set HTTP-only cookie
      generateTokenAndSetCookie(res, user._id, user.role);

      return sendSuccess(res, 201, 'User registered successfully', {
        user: user.toAuthJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.loginUser({ email, password });

      // Generate JWT and set HTTP-only cookie
      generateTokenAndSetCookie(res, user._id, user.role);

      return sendSuccess(res, 200, 'Login successful', {
        user: user.toAuthJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    clearAuthCookie(res);
    return sendSuccess(res, 200, 'Logged out successfully');
  }

  /**
   * GET /api/auth/me
   */
  static async getMe(req, res) {
    return sendSuccess(res, 200, 'Current user profile fetched successfully', {
      user: req.user.toAuthJSON()
    });
  }

  /**
   * PUT /api/auth/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user._id, { currentPassword, newPassword });
      return sendSuccess(res, 200, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
