const InterventionService = require('../../services/interventions/intervention.service');
const ImprovementService = require('../../services/interventions/improvement.service');
const InterventionAnalyticsService = require('../../services/interventions/interventionAnalytics.service');
const CourseAnalyticsController = require('../analytics/courseAnalytics.controller');
const { sendSuccess } = require('../../utils/apiResponse');

class InterventionController {
  // 1. Create manual intervention
  static async create(req, res, next) {
    try {
      const intervention = await InterventionService.createIntervention(req.body, req.user);
      return sendSuccess(res, 201, 'Intervention created successfully', { data: intervention });
    } catch (error) {
      next(error);
    }
  }

  // 2. Create intervention from Module 7 recommendation
  static async createFromRecommendation(req, res, next) {
    try {
      const { recommendationId } = req.params;
      const intervention = await InterventionService.createFromRecommendation(recommendationId, req.user, req.body);
      return sendSuccess(res, 201, 'Intervention created from recommendation', { data: intervention });
    } catch (error) {
      next(error);
    }
  }

  // 3. Get single intervention by ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const intervention = await InterventionService.getInterventionById(id, req.user);
      return sendSuccess(res, 200, 'Intervention details retrieved', { data: intervention });
    } catch (error) {
      next(error);
    }
  }

  // 4. Student acknowledge
  static async acknowledge(req, res, next) {
    try {
      const { id } = req.params;
      const intervention = await InterventionService.acknowledgeIntervention(id, req.user._id);
      return sendSuccess(res, 200, 'Intervention acknowledged', { data: intervention });
    } catch (error) {
      next(error);
    }
  }

  // 5. Student start
  static async start(req, res, next) {
    try {
      const { id } = req.params;
      const intervention = await InterventionService.startIntervention(id, req.user._id);
      return sendSuccess(res, 200, 'Intervention started', { data: intervention });
    } catch (error) {
      next(error);
    }
  }

  // 6. Student complete
  static async complete(req, res, next) {
    try {
      const { id } = req.params;
      const { studentResponse } = req.body;
      const intervention = await InterventionService.completeIntervention(id, req.user._id, studentResponse);
      return sendSuccess(res, 200, 'Intervention completed', { data: intervention });
    } catch (error) {
      next(error);
    }
  }

  // 7. Faculty review
  static async review(req, res, next) {
    try {
      const { id } = req.params;
      const intervention = await InterventionService.reviewIntervention(id, req.user, req.body);
      return sendSuccess(res, 200, 'Intervention review recorded', { data: intervention });
    } catch (error) {
      next(error);
    }
  }

  // 8. List interventions with role filtering & pagination
  static async list(req, res, next) {
    try {
      const { page, limit, courseId, studentId, status, priority, actionType, topic } = req.query;
      const filters = { courseId, studentId, status, priority, actionType, topic };
      const pagination = { page, limit };
      const result = await InterventionService.getInterventions(req.user, filters, pagination);
      return sendSuccess(res, 200, 'Interventions retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  // 9. Evaluate & measure outcome delta
  static async evaluateOutcome(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ImprovementService.evaluateInterventionOutcome(id);
      return sendSuccess(res, 200, 'Intervention outcome evaluated', { data: result });
    } catch (error) {
      next(error);
    }
  }

  // 10. Student improvement history
  static async getStudentImprovementHistory(req, res, next) {
    try {
      const studentId = req.user._id;
      const history = await ImprovementService.getStudentImprovementHistory(studentId);
      return sendSuccess(res, 200, 'Student improvement history retrieved', { data: history });
    } catch (error) {
      next(error);
    }
  }

  // 11. Faculty course intervention analytics
  static async getCourseAnalytics(req, res, next) {
    try {
      const { courseId } = req.params;
      await CourseAnalyticsController.verifyCourseAccess(courseId, req.user);
      const analytics = await InterventionAnalyticsService.getCourseInterventionAnalytics(courseId);
      return sendSuccess(res, 200, 'Course intervention analytics retrieved', { data: analytics });
    } catch (error) {
      next(error);
    }
  }

  // 12. Admin institution intervention analytics
  static async getAdminAnalytics(req, res, next) {
    try {
      const analytics = await InterventionAnalyticsService.getAdminInterventionAnalytics();
      return sendSuccess(res, 200, 'Institution intervention analytics retrieved', { data: analytics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InterventionController;
