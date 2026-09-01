const Intervention = require('../../models/Intervention');
const InterventionOutcome = require('../../models/InterventionOutcome');
const Course = require('../../models/Course');
const User = require('../../models/User');

class InterventionAnalyticsService {
  /**
   * Get faculty course-level intervention analytics
   */
  static async getCourseInterventionAnalytics(courseId) {
    const course = await Course.findById(courseId).select('title code').lean();
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    const [statusCounts, actionTypeCounts, outcomeCounts, outcomes] = await Promise.all([
      Intervention.aggregate([
        { $match: { courseId: new (require('mongoose').Types.ObjectId)(courseId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Intervention.aggregate([
        { $match: { courseId: new (require('mongoose').Types.ObjectId)(courseId) } },
        { $group: { _id: '$actionType', count: { $sum: 1 } } }
      ]),
      Intervention.aggregate([
        { $match: { courseId: new (require('mongoose').Types.ObjectId)(courseId), status: 'REVIEWED' } },
        { $group: { _id: '$outcome', count: { $sum: 1 } } }
      ]),
      InterventionOutcome.find({ courseId, measurementStatus: 'MEASURED' }).lean()
    ]);

    const statusSummary = {
      PENDING: 0,
      ASSIGNED: 0,
      ACKNOWLEDGED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      REVIEWED: 0,
      CANCELLED: 0,
      OVERDUE: 0
    };
    statusCounts.forEach((s) => {
      if (statusSummary[s._id] !== undefined) statusSummary[s._id] = s.count;
    });

    const actionTypeSummary = {};
    actionTypeCounts.forEach((a) => {
      actionTypeSummary[a._id] = a.count;
    });

    const outcomeSummary = {
      IMPROVED: 0,
      PARTIALLY_IMPROVED: 0,
      NO_SIGNIFICANT_CHANGE: 0,
      FURTHER_SUPPORT_REQUIRED: 0,
      NOT_COMPLETED: 0
    };
    outcomeCounts.forEach((o) => {
      if (outcomeSummary[o._id] !== undefined) outcomeSummary[o._id] = o.count;
    });

    let totalMeasured = outcomes.length;
    let successfulImprovements = outcomes.filter((o) => o.improvement > 0).length;
    let effectivenessRatio = totalMeasured > 0
      ? Number(((successfulImprovements / totalMeasured) * 100).toFixed(1))
      : null;

    return {
      courseId,
      courseTitle: course.title,
      courseCode: course.code,
      totalInterventions: Object.values(statusSummary).reduce((a, b) => a + b, 0),
      statusSummary,
      actionTypeSummary,
      outcomeSummary,
      totalMeasured,
      successfulImprovements,
      effectivenessRatio
    };
  }

  /**
   * Get institution-wide intervention analytics for admins
   */
  static async getAdminInterventionAnalytics() {
    const totalInterventions = await Intervention.countDocuments();
    const statusCounts = await Intervention.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const outcomeCounts = await Intervention.aggregate([
      { $match: { status: 'REVIEWED' } },
      { $group: { _id: '$outcome', count: { $sum: 1 } } }
    ]);

    const measuredOutcomes = await InterventionOutcome.find({ measurementStatus: 'MEASURED' }).lean();
    let successfulCount = measuredOutcomes.filter((o) => o.improvement > 0).length;

    const statusSummary = {};
    statusCounts.forEach((s) => {
      statusSummary[s._id] = s.count;
    });

    const outcomeSummary = {};
    outcomeCounts.forEach((o) => {
      outcomeSummary[o._id] = o.count;
    });

    const overallEffectiveness = measuredOutcomes.length > 0
      ? Number(((successfulCount / measuredOutcomes.length) * 100).toFixed(1))
      : null;

    return {
      totalInterventions,
      statusSummary,
      outcomeSummary,
      totalMeasured: measuredOutcomes.length,
      overallEffectiveness
    };
  }
}

module.exports = InterventionAnalyticsService;
