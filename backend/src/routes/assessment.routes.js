const express = require('express');
const router = express.Router();
const AssessmentController = require('../controllers/assessment.controller');
const SubmissionController = require('../controllers/submission.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Course-level assessment routes
router.get(
  '/courses/:courseId/assessments',
  authenticate,
  AssessmentController.getCourseAssessments
);

router.post(
  '/courses/:courseId/assessments',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  AssessmentController.createAssessment
);

// Individual assessment routes
router.get(
  '/assessments/:assessmentId',
  authenticate,
  AssessmentController.getAssessmentById
);

router.put(
  '/assessments/:assessmentId',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  AssessmentController.updateAssessment
);

router.delete(
  '/assessments/:assessmentId',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  AssessmentController.deleteAssessment
);

// Submissions & Grading routes
router.post(
  '/assessments/:assessmentId/submit',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  SubmissionController.submitAssessment
);

router.get(
  '/assessments/:assessmentId/my-submission',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  SubmissionController.getStudentSubmission
);

router.get(
  '/assessments/:assessmentId/submissions',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  SubmissionController.getAssessmentSubmissions
);

router.put(
  '/submissions/:submissionId/grade',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  SubmissionController.gradeSubmission
);

module.exports = router;
