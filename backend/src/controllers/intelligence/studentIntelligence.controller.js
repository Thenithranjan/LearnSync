const IntelligenceService = require('../../services/intelligence/intelligence.service');
const LearningGapService = require('../../services/intelligence/learningGap.service');
const RiskScoreService = require('../../services/intelligence/riskScore.service');
const RecommendationService = require('../../services/intelligence/recommendation.service');
const { sendSuccess } = require('../../utils/apiResponse');

class StudentIntelligenceController {
  static async getOverview(req, res, next) {
    try {
      const studentId = req.user._id;
      const { courseId } = req.query;
      const overview = await IntelligenceService.getStudentIntelligenceOverview(studentId, courseId);
      return sendSuccess(res, 200, 'Student intelligence overview retrieved', { data: overview });
    } catch (error) {
      next(error);
    }
  }

  static async getGaps(req, res, next) {
    try {
      const studentId = req.user._id;
      const { courseId } = req.query;
      const gaps = await LearningGapService.detectStudentGaps(studentId, courseId);
      return sendSuccess(res, 200, 'Student learning gaps retrieved', { data: gaps });
    } catch (error) {
      next(error);
    }
  }

  static async getRisk(req, res, next) {
    try {
      const studentId = req.user._id;
      const { courseId } = req.query;
      const risk = await RiskScoreService.calculateStudentRisk(studentId, courseId);
      return sendSuccess(res, 200, 'Student risk analysis retrieved', { data: risk });
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendations(req, res, next) {
    try {
      const studentId = req.user._id;
      const { courseId } = req.query;
      const recommendations = await RecommendationService.getStudentRecommendations(studentId, courseId);
      return sendSuccess(res, 200, 'Student recommendations retrieved', { data: recommendations });
    } catch (error) {
      next(error);
    }
  }

  static async completeRecommendation(req, res, next) {
    try {
      const studentId = req.user._id;
      const { id } = req.params;
      const rec = await RecommendationService.completeRecommendation(id, studentId);
      return sendSuccess(res, 200, 'Recommendation marked completed', { data: rec });
    } catch (error) {
      next(error);
    }
  }

  static async dismissRecommendation(req, res, next) {
    try {
      const studentId = req.user._id;
      const { id } = req.params;
      const rec = await RecommendationService.dismissRecommendation(id, studentId);
      return sendSuccess(res, 200, 'Recommendation dismissed', { data: rec });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentIntelligenceController;
