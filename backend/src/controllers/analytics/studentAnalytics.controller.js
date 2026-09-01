const StudentAnalyticsService = require('../../services/analytics/studentAnalytics.service');
const TopicAnalyticsService = require('../../services/analytics/topicAnalytics.service');
const { sendSuccess } = require('../../utils/apiResponse');

class StudentAnalyticsController {
  static async getOverview(req, res, next) {
    try {
      const studentId = req.user._id;
      const { courseId } = req.query;
      const overview = await StudentAnalyticsService.getStudentOverview(studentId, { courseId });
      return sendSuccess(res, 200, 'Student overview analytics retrieved', overview);
    } catch (error) {
      next(error);
    }
  }

  static async getCourses(req, res, next) {
    try {
      const studentId = req.user._id;
      const courses = await StudentAnalyticsService.getStudentCourses(studentId);
      return sendSuccess(res, 200, 'Student course performance retrieved', courses);
    } catch (error) {
      next(error);
    }
  }

  static async getTrends(req, res, next) {
    try {
      const studentId = req.user._id;
      const { courseId } = req.query;
      const trends = await StudentAnalyticsService.getStudentTrends(studentId, courseId);
      return sendSuccess(res, 200, 'Student performance trends retrieved', trends);
    } catch (error) {
      next(error);
    }
  }

  static async getTopics(req, res, next) {
    try {
      const studentId = req.user._id;
      const { courseId } = req.query;
      const topics = await TopicAnalyticsService.getStudentTopicAnalytics(studentId, courseId);
      return sendSuccess(res, 200, 'Student topic performance retrieved', topics);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentAnalyticsController;
