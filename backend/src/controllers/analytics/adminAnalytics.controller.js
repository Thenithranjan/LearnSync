const AdminAnalyticsService = require('../../services/analytics/adminAnalytics.service');
const { sendSuccess } = require('../../utils/apiResponse');

class AdminAnalyticsController {
  static async getOverview(req, res, next) {
    try {
      const overview = await AdminAnalyticsService.getAdminOverview();
      return sendSuccess(res, 200, 'Institution overview analytics retrieved', { data: overview });
    } catch (error) {
      next(error);
    }
  }

  static async getDepartments(req, res, next) {
    try {
      const departments = await AdminAnalyticsService.getDepartmentAnalytics();
      return sendSuccess(res, 200, 'Department performance analytics retrieved', { data: departments });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminAnalyticsController;
