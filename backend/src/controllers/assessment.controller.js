const AssessmentService = require('../services/assessment.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

class AssessmentController {
  static async createAssessment(req, res, next) {
    try {
      const { courseId } = req.params;
      const assessment = await AssessmentService.createAssessment(
        req.user._id,
        courseId,
        req.body
      );
      return sendSuccess(res, 201, 'Assessment created successfully', assessment);
    } catch (error) {
      next(error);
    }
  }

  static async getCourseAssessments(req, res, next) {
    try {
      const { courseId } = req.params;
      const assessments = await AssessmentService.getCourseAssessments(
        courseId,
        req.user.role
      );
      return sendSuccess(res, 200, 'Assessments retrieved successfully', assessments);
    } catch (error) {
      next(error);
    }
  }

  static async getAssessmentById(req, res, next) {
    try {
      const { assessmentId } = req.params;
      const assessment = await AssessmentService.getAssessmentById(
        assessmentId,
        req.user.role
      );
      return sendSuccess(res, 200, 'Assessment details retrieved', assessment);
    } catch (error) {
      next(error);
    }
  }

  static async updateAssessment(req, res, next) {
    try {
      const { assessmentId } = req.params;
      const assessment = await AssessmentService.updateAssessment(
        assessmentId,
        req.user._id,
        req.user.role,
        req.body
      );
      return sendSuccess(res, 200, 'Assessment updated successfully', assessment);
    } catch (error) {
      next(error);
    }
  }

  static async deleteAssessment(req, res, next) {
    try {
      const { assessmentId } = req.params;
      const result = await AssessmentService.deleteAssessment(
        assessmentId,
        req.user._id,
        req.user.role
      );
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AssessmentController;
