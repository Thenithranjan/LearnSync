const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Course session management
router.post(
  '/courses/:courseId/attendance/sessions',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  AttendanceController.createSession
);

router.get(
  '/courses/:courseId/attendance/sessions',
  authenticate,
  AttendanceController.getCourseSessions
);

// Individual session roster & batch marking
router.get(
  '/attendance/sessions/:sessionId',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  AttendanceController.getSessionRoster
);

router.put(
  '/attendance/sessions/:sessionId/roster',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  AttendanceController.batchMarkAttendance
);

// Student self check-in via OTP
router.post(
  '/courses/:courseId/attendance/check-in',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  AttendanceController.selfCheckIn
);

// Student attendance summary
router.get(
  '/courses/:courseId/attendance/my-summary',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  AttendanceController.getStudentAttendanceSummary
);

// Course-wide faculty attendance report
router.get(
  '/courses/:courseId/attendance/report',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  AttendanceController.getCourseAttendanceReport
);

module.exports = router;
