const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const InterventionController = require('../controllers/interventions/intervention.controller');

// ==========================================
// 1. GENERAL INTERVENTION LIST & CRUD
// ==========================================

// Create manual intervention (Faculty / Admin)
router.post(
  '/interventions',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  InterventionController.create
);

// Create intervention from Module 7 Recommendation (Faculty / Admin)
router.post(
  '/interventions/from-recommendation/:recommendationId',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  InterventionController.createFromRecommendation
);

// List interventions (Role-filtered)
router.get(
  '/interventions',
  authenticate,
  authorize('STUDENT', 'FACULTY', 'ADMIN'),
  InterventionController.list
);

// Student personal improvement history
router.get(
  '/interventions/student/history',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  InterventionController.getStudentImprovementHistory
);

// Faculty course intervention analytics
router.get(
  '/interventions/analytics/course/:courseId',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  InterventionController.getCourseAnalytics
);

// Admin institution intervention analytics
router.get(
  '/interventions/admin/analytics',
  authenticate,
  authorize('ADMIN'),
  InterventionController.getAdminAnalytics
);

// Get single intervention details
router.get(
  '/interventions/:id',
  authenticate,
  authorize('STUDENT', 'FACULTY', 'ADMIN'),
  InterventionController.getById
);

// ==========================================
// 2. STUDENT WORKFLOW STATUS TRANSITIONS
// ==========================================
router.post(
  '/interventions/:id/acknowledge',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  InterventionController.acknowledge
);

router.post(
  '/interventions/:id/start',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  InterventionController.start
);

router.post(
  '/interventions/:id/complete',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  InterventionController.complete
);

// ==========================================
// 3. FACULTY REVIEW & OUTCOME EVALUATION
// ==========================================
router.post(
  '/interventions/:id/review',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  InterventionController.review
);

router.post(
  '/interventions/:id/evaluate',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  InterventionController.evaluateOutcome
);

module.exports = router;
