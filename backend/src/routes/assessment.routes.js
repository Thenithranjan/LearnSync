const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/assessment.controller');
const SubmissionController = require('../controllers/submission.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Course-level assessment routes
router.get(
  '/courses/:courseId/assessments',
  protect,
  AssessmentController.getCourseAssessments
);

router.post(
  '/courses/:courseId/assessments',
  protect,
  authorize('FACULTY', 'ADMIN'),
  AssessmentController.createAssessment
);

// Individual assessment routes
router.get(
  '/assessments/:assessmentId',
  protect,
  AssessmentController.getAssessmentById
);

router.put(
  '/assessments/:assessmentId',
  protect,
  authorize('FACULTY', 'ADMIN'),
  AssessmentController.updateAssessment
);

router.delete(
  '/assessments/:assessmentId',
  protect,
  authorize('FACULTY', 'ADMIN'),
  AssessmentController.deleteAssessment
);

// Submissions & Grading routes
router.post(
  '/assessments/:assessmentId/submit',
  protect,
  authorize('STUDENT', 'ADMIN'),
  SubmissionController.submitAssessment
);

router.get(
  '/assessments/:assessmentId/my-submission',
  protect,
  authorize('STUDENT', 'ADMIN'),
  SubmissionController.getStudentSubmission
);

router.get(
  '/assessments/:assessmentId/submissions',
  protect,
  authorize('FACULTY', 'ADMIN'),
  SubmissionController.getAssessmentSubmissions
);

router.put(
  '/submissions/:submissionId/grade',
  protect,
  authorize('FACULTY', 'ADMIN'),
  SubmissionController.gradeSubmission
);

module.exports = router;
