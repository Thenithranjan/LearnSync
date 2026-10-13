const DashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/apiResponse');

class DashboardController {
  static async getStudentDashboard(req, res, next) {
    try {
      const data = await DashboardService.getStudentDashboard(req.user._id);
      return sendSuccess(res, 200, 'Student dashboard retrieved', { data });
    } catch (error) {
      next(error);
    }
  }

  static async getFacultyDashboard(req, res, next) {
    try {
      const data = await DashboardService.getFacultyDashboard(req.user._id);
      return sendSuccess(res, 200, 'Faculty dashboard retrieved', { data });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminDashboard(req, res, next) {
    try {
      const data = await DashboardService.getAdminDashboard();
      return sendSuccess(res, 200, 'Admin dashboard retrieved', { data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
