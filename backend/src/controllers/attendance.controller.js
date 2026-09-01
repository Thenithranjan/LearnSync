const AttendanceService = require('../services/attendance.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

class AttendanceController {
  static async createSession(req, res, next) {
    try {
      const { courseId } = req.params;
      const session = await AttendanceService.createSession(
        req.user._id,
        courseId,
        req.body
      );
      return sendSuccess(res, 201, 'Attendance session created successfully', { data: session });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseSessions(req, res, next) {
    try {
      const { courseId } = req.params;
      const sessions = await AttendanceService.getCourseSessions(
        courseId,
        req.user.role
      );
      return sendSuccess(res, 200, 'Attendance sessions retrieved', { data: sessions });
    } catch (error) {
      next(error);
    }
  }

  static async getSessionRoster(req, res, next) {
    try {
      const { sessionId } = req.params;
      const data = await AttendanceService.getSessionRoster(sessionId);
      return sendSuccess(res, 200, 'Session roster retrieved', { data });
    } catch (error) {
      next(error);
    }
  }

  static async batchMarkAttendance(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { records } = req.body;
      const result = await AttendanceService.batchMarkAttendance(
        sessionId,
        req.user._id,
        records
      );
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async selfCheckIn(req, res, next) {
    try {
      const { courseId } = req.params;
      const { otpCode } = req.body;
      const result = await AttendanceService.selfCheckIn(
        req.user._id,
        courseId,
        otpCode
      );
      return sendSuccess(res, 200, result.message, { data: result.record });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentAttendanceSummary(req, res, next) {
    try {
      const { courseId } = req.params;
      const summary = await AttendanceService.getStudentAttendanceSummary(
        courseId,
        req.user._id
      );
      return sendSuccess(res, 200, 'Attendance summary retrieved', { data: summary });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseAttendanceReport(req, res, next) {
    try {
      const { courseId } = req.params;
      const report = await AttendanceService.getCourseAttendanceReport(courseId);
      return sendSuccess(res, 200, 'Course attendance report retrieved', { data: report });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AttendanceController;
