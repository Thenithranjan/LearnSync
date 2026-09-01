const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth.middleware');

const StudentAnalyticsController = require('../controllers/analytics/studentAnalytics.controller');
const CourseAnalyticsController = require('../controllers/analytics/courseAnalytics.controller');
const FacultyAnalyticsController = require('../controllers/analytics/facultyAnalytics.controller');
const AdminAnalyticsController = require('../controllers/analytics/adminAnalytics.controller');

// ==========================================
// 1. STUDENT ANALYTICS ENDPOINTS
// Accessible by Authenticated Student / Admin
// ==========================================
router.get(
  '/analytics/student/overview',
  authenticate,
  authorizeRole('STUDENT', 'ADMIN'),
  StudentAnalyticsController.getOverview
);

router.get(
  '/analytics/student/courses',
  authenticate,
  authorizeRole('STUDENT', 'ADMIN'),
  StudentAnalyticsController.getCourses
);

router.get(
  '/analytics/student/trends',
  authenticate,
  authorizeRole('STUDENT', 'ADMIN'),
  StudentAnalyticsController.getTrends
);

router.get(
  '/analytics/student/topics',
  authenticate,
  authorizeRole('STUDENT', 'ADMIN'),
  StudentAnalyticsController.getTopics
);

// ==========================================
// 2. FACULTY ANALYTICS ENDPOINTS
// Accessible by Authenticated Faculty / Admin
// ==========================================
router.get(
  '/analytics/faculty/overview',
  authenticate,
  authorizeRole('FACULTY', 'ADMIN'),
  FacultyAnalyticsController.getOverview
);

// ==========================================
// 3. COURSE-LEVEL ANALYTICS ENDPOINTS
// Accessible by Course Faculty / Admin
// ==========================================
router.get(
  '/analytics/course/:courseId/trends',
  authenticate,
  authorizeRole('FACULTY', 'ADMIN'),
  CourseAnalyticsController.getTrends
);

router.get(
  '/analytics/course/:courseId/distribution',
  authenticate,
  authorizeRole('FACULTY', 'ADMIN'),
  CourseAnalyticsController.getDistribution
);

router.get(
  '/analytics/course/:courseId/topics',
  authenticate,
  authorizeRole('FACULTY', 'ADMIN'),
  CourseAnalyticsController.getTopics
);

router.get(
  '/analytics/course/:courseId/students',
  authenticate,
  authorizeRole('FACULTY', 'ADMIN'),
  CourseAnalyticsController.getStudents
);

// ==========================================
// 4. ADMIN INSTITUTION ANALYTICS ENDPOINTS
// Accessible only by Admin
// ==========================================
router.get(
  '/analytics/admin/overview',
  authenticate,
  authorizeRole('ADMIN'),
  AdminAnalyticsController.getOverview
);

router.get(
  '/analytics/admin/departments',
  authenticate,
  authorizeRole('ADMIN'),
  AdminAnalyticsController.getDepartments
);

module.exports = router;
