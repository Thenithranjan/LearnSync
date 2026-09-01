const CourseAnalyticsService = require('../../services/analytics/courseAnalytics.service');
const TopicAnalyticsService = require('../../services/analytics/topicAnalytics.service');
const Course = require('../../models/Course');
const { sendSuccess } = require('../../utils/apiResponse');

class CourseAnalyticsController {
  // Helper to verify faculty or admin authorization for this course
  static async verifyCourseAccess(courseId, user) {
    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'FACULTY' && (!course.faculty || course.faculty.toString() !== user._id.toString())) {
      const error = new Error('Unauthorized. You can only view analytics for courses assigned to you.');
      error.statusCode = 403;
      throw error;
    }

    return course;
  }

  static async getTrends(req, res, next) {
    try {
      const { courseId } = req.params;
      await CourseAnalyticsController.verifyCourseAccess(courseId, req.user);
      const trends = await CourseAnalyticsService.getCourseTrends(courseId);
      return sendSuccess(res, 200, 'Course performance trends retrieved', trends);
    } catch (error) {
      next(error);
    }
  }

  static async getDistribution(req, res, next) {
    try {
      const { courseId } = req.params;
      await CourseAnalyticsController.verifyCourseAccess(courseId, req.user);
      const distribution = await CourseAnalyticsService.getCourseDistribution(courseId);
      return sendSuccess(res, 200, 'Course performance distribution retrieved', distribution);
    } catch (error) {
      next(error);
    }
  }

  static async getTopics(req, res, next) {
    try {
      const { courseId } = req.params;
      await CourseAnalyticsController.verifyCourseAccess(courseId, req.user);
      const topics = await TopicAnalyticsService.getCourseTopicAnalytics(courseId);
      return sendSuccess(res, 200, 'Course topic performance retrieved', topics);
    } catch (error) {
      next(error);
    }
  }

  static async getStudents(req, res, next) {
    try {
      const { courseId } = req.params;
      const { sortBy, sortOrder, search } = req.query;
      await CourseAnalyticsController.verifyCourseAccess(courseId, req.user);
      const studentData = await CourseAnalyticsService.getCourseStudents(courseId, {
        sortBy,
        sortOrder,
        search
      });
      return sendSuccess(res, 200, 'Course student analytics retrieved', studentData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseAnalyticsController;
