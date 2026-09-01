const FacultyAnalyticsService = require('../../services/analytics/facultyAnalytics.service');
const { sendSuccess } = require('../../utils/apiResponse');

class FacultyAnalyticsController {
  static async getOverview(req, res, next) {
    try {
      const facultyId = req.user._id;
      const overview = await FacultyAnalyticsService.getFacultyOverview(facultyId);
      return sendSuccess(res, 200, 'Faculty overview analytics retrieved', { data: overview });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FacultyAnalyticsController;
