const { sendSuccess } = require('../utils/apiResponse');

/**
 * Controller for testing role-based access endpoints.
 */
class TestController {
  /**
   * GET /api/admin/test
   */
  static async adminTest(req, res) {
    return sendSuccess(res, 200, 'Admin test endpoint reached successfully', {
      accessGranted: true,
      role: req.user.role,
      user: req.user.toAuthJSON()
    });
  }

  /**
   * GET /api/faculty/test
   */
  static async facultyTest(req, res) {
    return sendSuccess(res, 200, 'Faculty test endpoint reached successfully', {
      accessGranted: true,
      role: req.user.role,
      user: req.user.toAuthJSON()
    });
  }

  /**
   * GET /api/student/test
   */
  static async studentTest(req, res) {
    return sendSuccess(res, 200, 'Student test endpoint reached successfully', {
      accessGranted: true,
      role: req.user.role,
      user: req.user.toAuthJSON()
    });
  }
}

module.exports = TestController;
