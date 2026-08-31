const ProgressService = require('../services/progress.service');
const { sendSuccess } = require('../utils/apiResponse');

class ProgressController {
  /**
   * POST /api/materials/:id/complete
   */
  static async toggleComplete(req, res, next) {
    try {
      const { completed } = req.body;
      const result = await ProgressService.toggleMaterialComplete(
        req.params.id,
        req.user,
        completed !== undefined ? Boolean(completed) : true
      );
      return sendSuccess(res, 200, 'Material completion status updated', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courses/:id/progress
   */
  static async getProgress(req, res, next) {
    try {
      const progressData = await ProgressService.getCourseProgress(req.params.id, req.user);
      return sendSuccess(res, 200, 'Course progress retrieved successfully', progressData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProgressController;
