const DashboardService = require('../services/dashboard.service');
const requestCache = require('../utils/requestCache');
const { sendSuccess } = require('../utils/apiResponse');

class DashboardController {
  static logPerf(req, label) {
    requestCache.mark(label);
    console.log(`[Perf] ${req.method} ${req.path} :: ${requestCache.summary()}`);
  }

  static async getStudentDashboard(req, res, next) {
    try {
      const data = await DashboardService.getStudentDashboard(req.user._id);
      DashboardController.logPerf(req, 'done');
      return sendSuccess(res, 200, 'Student dashboard retrieved', { data });
    } catch (error) {
      next(error);
    }
  }

  static async getFacultyDashboard(req, res, next) {
    try {
      const data = await DashboardService.getFacultyDashboard(req.user._id);
      DashboardController.logPerf(req, 'done');
      return sendSuccess(res, 200, 'Faculty dashboard retrieved', { data });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminDashboard(req, res, next) {
    try {
      const data = await DashboardService.getAdminDashboard();
      DashboardController.logPerf(req, 'done');
      return sendSuccess(res, 200, 'Admin dashboard retrieved', { data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
