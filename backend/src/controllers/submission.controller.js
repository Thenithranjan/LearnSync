const SubmissionService = require('../services/submission.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

class SubmissionController {
  static async submitAssessment(req, res, next) {
    try {
      const { assessmentId } = req.params;
      const submission = await SubmissionService.submitAssessment(
        req.user._id,
        assessmentId,
        req.body
      );
      return sendSuccess(res, 200, 'Assessment submitted successfully', submission);
    } catch (error) {
      next(error);
    }
  }

  static async getStudentSubmission(req, res, next) {
    try {
      const { assessmentId } = req.params;
      const submission = await SubmissionService.getStudentSubmission(
        assessmentId,
        req.user._id
      );
      return sendSuccess(res, 200, 'Submission retrieved', submission);
    } catch (error) {
      next(error);
    }
  }

  static async getAssessmentSubmissions(req, res, next) {
    try {
      const { assessmentId } = req.params;
      const submissions = await SubmissionService.getAssessmentSubmissions(assessmentId);
      return sendSuccess(res, 200, 'All submissions retrieved', submissions);
    } catch (error) {
      next(error);
    }
  }

  static async gradeSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const { score, feedback } = req.body;
      const graded = await SubmissionService.gradeSubmission(
        submissionId,
        req.user._id,
        { score, feedback }
      );
      return sendSuccess(res, 200, 'Submission graded successfully', graded);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubmissionController;
