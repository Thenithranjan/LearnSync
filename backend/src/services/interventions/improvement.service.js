const Intervention = require('../../models/Intervention');
const InterventionOutcome = require('../../models/InterventionOutcome');
const TopicAnalyticsService = require('../analytics/topicAnalytics.service');
const { classifyImprovement, mapClassificationToOutcome } = require('./intervention.utils');

class ImprovementService {
  /**
   * Evaluate and record before/after performance improvement for an intervention
   */
  static async evaluateInterventionOutcome(interventionId) {
    const intervention = await Intervention.findById(interventionId).lean();
    if (!intervention) {
      const error = new Error('Intervention not found');
      error.statusCode = 404;
      throw error;
    }

    let outcomeDoc = await InterventionOutcome.findOne({ interventionId });
    if (!outcomeDoc) {
      // Create if missing
      outcomeDoc = await InterventionOutcome.create({
        interventionId,
        studentId: intervention.studentId,
        courseId: intervention.courseId,
        topic: intervention.topic,
        beforeScore: 50,
        measurementStatus: 'PENDING'
      });
    }

    // Fetch post-intervention topic performance
    const topicStats = await TopicAnalyticsService.getStudentTopicAnalytics(
      intervention.studentId,
      intervention.courseId
    );
    const matchedTopic = topicStats.find(
      (t) => t.topic.toLowerCase() === intervention.topic.toLowerCase()
    );

    if (!matchedTopic || matchedTopic.questionsAttempted < 2) {
      outcomeDoc.measurementStatus = 'INSUFFICIENT_DATA';
      await outcomeDoc.save();
      return {
        outcome: outcomeDoc,
        explanation: 'Insufficient post-intervention evaluation activity to compute quantitative improvement.'
      };
    }

    const afterScore = matchedTopic.accuracy;
    const improvement = Number((afterScore - outcomeDoc.beforeScore).toFixed(1));
    const classification = classifyImprovement(improvement);
    const mappedOutcome = mapClassificationToOutcome(classification);

    outcomeDoc.afterScore = afterScore;
    outcomeDoc.improvement = improvement;
    outcomeDoc.classification = classification;
    outcomeDoc.measurementStatus = 'MEASURED';
    outcomeDoc.evaluatedAt = new Date();
    await outcomeDoc.save();

    // Auto-update intervention outcome if reviewed
    if (intervention.status === 'COMPLETED' || intervention.status === 'REVIEWED') {
      await Intervention.findByIdAndUpdate(interventionId, {
        outcome: mappedOutcome
      });
    }

    return {
      outcome: outcomeDoc,
      explanation: `Before: ${outcomeDoc.beforeScore}%, After: ${afterScore}%. Net Improvement: ${improvement > 0 ? '+' : ''}${improvement} percentage points.`
    };
  }

  /**
   * Get student personal improvement history
   */
  static async getStudentImprovementHistory(studentId) {
    const outcomes = await InterventionOutcome.find({
      studentId,
      measurementStatus: 'MEASURED'
    })
      .populate('interventionId', 'title actionType topic priority completedAt')
      .populate('courseId', 'title code')
      .sort({ evaluatedAt: -1 })
      .lean();

    let totalGain = 0;
    let improvedTopicsCount = 0;

    outcomes.forEach((o) => {
      if (o.improvement > 0) {
        totalGain += o.improvement;
        improvedTopicsCount++;
      }
    });

    const averageImprovement = outcomes.length > 0
      ? Number((totalGain / outcomes.length).toFixed(1))
      : 0;

    return {
      studentId,
      totalMeasuredInterventions: outcomes.length,
      improvedTopicsCount,
      averageImprovement,
      history: outcomes
    };
  }
}

module.exports = ImprovementService;
