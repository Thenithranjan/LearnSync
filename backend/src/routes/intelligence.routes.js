const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');

const StudentIntelligenceController = require('../controllers/intelligence/studentIntelligence.controller');
const FacultyIntelligenceController = require('../controllers/intelligence/facultyIntelligence.controller');
const AdminIntelligenceController = require('../controllers/intelligence/adminIntelligence.controller');

// ==========================================
// 1. STUDENT INTELLIGENCE ENDPOINTS
// Accessible by Authenticated Student / Admin
// ==========================================
router.get(
  '/intelligence/student/overview',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  StudentIntelligenceController.getOverview
);

router.get(
  '/intelligence/student/gaps',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  StudentIntelligenceController.getGaps
);

router.get(
  '/intelligence/student/risk',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  StudentIntelligenceController.getRisk
);

router.get(
  '/intelligence/student/recommendations',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  StudentIntelligenceController.getRecommendations
);

router.post(
  '/intelligence/recommendations/:id/complete',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  StudentIntelligenceController.completeRecommendation
);

router.post(
  '/intelligence/recommendations/:id/dismiss',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  StudentIntelligenceController.dismissRecommendation
);

// ==========================================
// 2. FACULTY COURSE INTELLIGENCE ENDPOINTS
// Accessible by Course Faculty / Admin
// ==========================================
router.get(
  '/intelligence/course/:courseId/early-warning',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  FacultyIntelligenceController.getCourseEarlyWarning
);

router.get(
  '/intelligence/course/:courseId/topics',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  FacultyIntelligenceController.getCourseTopics
);

router.get(
  '/intelligence/course/:courseId/students/:studentId',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  FacultyIntelligenceController.getStudentRiskDetail
);

// ==========================================
// 3. ADMIN INSTITUTION INTELLIGENCE ENDPOINTS
// Accessible only by Admin
// ==========================================
router.get(
  '/intelligence/admin/overview',
  authenticate,
  authorize('ADMIN'),
  AdminIntelligenceController.getOverview
);

module.exports = router;
