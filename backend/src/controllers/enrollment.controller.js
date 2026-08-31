const EnrollmentService = require('../services/enrollment.service');
const { sendSuccess } = require('../utils/apiResponse');

class EnrollmentController {
  /**
   * POST /api/courses/:courseId/enroll
   */
  static async enroll(req, res, next) {
    try {
      const enrollment = await EnrollmentService.enrollStudent(req.params.courseId, req.user);
      return sendSuccess(res, 201, 'Enrolled in course successfully', { enrollment });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courses/my-courses (Enrolled courses for student)
   */
  static async getMyEnrolledCourses(req, res, next) {
    try {
      const enrollments = await EnrollmentService.getStudentEnrolledCourses(req.user);
      return sendSuccess(res, 200, 'Enrolled courses retrieved successfully', { enrollments });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courses/:courseId/enrollment
   */
  static async checkStatus(req, res, next) {
    try {
      const statusData = await EnrollmentService.checkEnrollmentStatus(req.params.courseId, req.user);
      return sendSuccess(res, 200, 'Enrollment status retrieved', statusData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EnrollmentController;
