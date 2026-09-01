const IntelligenceService = require('../../services/intelligence/intelligence.service');
const { sendSuccess } = require('../../utils/apiResponse');

class AdminIntelligenceController {
  static async getOverview(req, res, next) {
    try {
      const overview = await IntelligenceService.getAdminIntelligenceOverview();
      return sendSuccess(res, 200, 'Institution intelligence overview retrieved', { data: overview });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminIntelligenceController;
