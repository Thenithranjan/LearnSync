const EarlyWarningService = require('../../services/intelligence/earlyWarning.service');
const LearningGapService = require('../../services/intelligence/learningGap.service');
const RiskScoreService = require('../../services/intelligence/riskScore.service');
const CourseAnalyticsController = require('../analytics/courseAnalytics.controller');
const { sendSuccess } = require('../../utils/apiResponse');

class FacultyIntelligenceController {
  static async getCourseEarlyWarning(req, res, next) {
    try {
      const { courseId } = req.params;
      await CourseAnalyticsController.verifyCourseAccess(courseId, req.user);
      const warnings = await EarlyWarningService.getCourseEarlyWarnings(courseId);
      return sendSuccess(res, 200, 'Course early warnings retrieved', { data: warnings });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseTopics(req, res, next) {
    try {
      const { courseId } = req.params;
      await CourseAnalyticsController.verifyCourseAccess(courseId, req.user);
      const topicAnalysis = await LearningGapService.detectCourseAttentionTopics(courseId);
      return sendSuccess(res, 200, 'Course topic intelligence retrieved', { data: topicAnalysis });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentRiskDetail(req, res, next) {
    try {
      const { courseId, studentId } = req.params;
      await CourseAnalyticsController.verifyCourseAccess(courseId, req.user);
      const [risk, gaps] = await Promise.all([
        RiskScoreService.calculateStudentRisk(studentId, courseId),
        LearningGapService.detectStudentGaps(studentId, courseId)
      ]);
      return sendSuccess(res, 200, 'Student risk detail retrieved', { data: { risk, gaps } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FacultyIntelligenceController;
