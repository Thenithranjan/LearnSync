const StudentAnalyticsService = require('../analytics/studentAnalytics.service');
const {
  RISK_WEIGHTS,
  analyzePerformanceTrend,
  getRiskLevel
} = require('./intelligence.utils');

class RiskScoreService {
  /**
   * Compute explainable 0-100 academic risk indicator and factor contributions
   */
  static async calculateStudentRisk(studentId, courseId = null) {
    const overview = await StudentAnalyticsService.getStudentOverview(studentId, { courseId });
    const trends = await StudentAnalyticsService.getStudentTrends(studentId, courseId);

    // Check data sufficiency: require student to have actually attempted an assessment or had attendance marked
    const hasAssessments = (overview.metrics?.quizzesAttempted || 0) > 0 || (overview.metrics?.assignmentsSubmitted || 0) > 0;
    const hasAttendanceRecords = (overview.metrics?.attendancePresentCount || 0) > 0;

    if (!hasAssessments && !hasAttendanceRecords) {
      return {
        riskScore: null,
        riskLevel: 'INSUFFICIENT_DATA',
        explanation: 'Insufficient academic evaluation activity recorded to compute a reliable risk indicator.',
        factors: [],
        trendAnalysis: { trend: 'INSUFFICIENT_DATA', change: 0 }
      };
    }

    const quizScore = overview.quizPerformance !== null ? overview.quizPerformance : 50; // Neutral fallback if not applicable
    const assignScore = overview.assignmentPerformance !== null ? overview.assignmentPerformance : 50;
    const attendance = overview.attendance !== null ? overview.attendance : 50;
    const progress = overview.learningProgress !== null ? overview.learningProgress : 50;
    const engagement = overview.engagement !== null ? overview.engagement : 50;

    const trendResult = analyzePerformanceTrend(trends.scores || []);

    // Risk Factor components (Inverted: 100 - Score = Deficit)
    const quizDeficit = Math.max(0, 100 - quizScore);
    const assignDeficit = Math.max(0, 100 - assignScore);
    const attendDeficit = Math.max(0, 100 - attendance);
    const progressDeficit = Math.max(0, 100 - progress);
    const engagementDeficit = Math.max(0, 100 - engagement);

    const quizContrib = Number((quizDeficit * RISK_WEIGHTS.quiz).toFixed(1));
    const assignContrib = Number((assignDeficit * RISK_WEIGHTS.assignment).toFixed(1));
    const attendContrib = Number((attendDeficit * RISK_WEIGHTS.attendance).toFixed(1));
    const progressContrib = Number((progressDeficit * RISK_WEIGHTS.learningProgress).toFixed(1));
    const engagementContrib = Number((engagementDeficit * RISK_WEIGHTS.engagement).toFixed(1));
    const trendContrib = trendResult.riskFactorContribution;

    const rawRiskScore = quizContrib + assignContrib + attendContrib + progressContrib + engagementContrib + trendContrib;
    const riskScore = Math.min(100, Math.max(0, Math.round(rawRiskScore)));
    const riskLevel = getRiskLevel(riskScore);

    // Build factor-by-factor explainable details
    const factors = [
      {
        factor: 'Quiz Performance',
        value: overview.quizPerformance !== null ? overview.quizPerformance : null,
        weight: '25%',
        contribution: quizContrib,
        status: quizScore >= 75 ? 'POSITIVE' : quizScore >= 50 ? 'NEUTRAL' : 'ATTENTION',
        description: overview.quizPerformance !== null
          ? `Quiz average is ${overview.quizPerformance}%, contributing ${quizContrib} points to overall risk.`
          : 'No quiz attempts recorded yet.'
      },
      {
        factor: 'Assignment Performance',
        value: overview.assignmentPerformance !== null ? overview.assignmentPerformance : null,
        weight: '20%',
        contribution: assignContrib,
        status: assignScore >= 75 ? 'POSITIVE' : assignScore >= 50 ? 'NEUTRAL' : 'ATTENTION',
        description: overview.assignmentPerformance !== null
          ? `Assignment score is ${overview.assignmentPerformance}%, contributing ${assignContrib} points to overall risk.`
          : 'No assignments submitted yet.'
      },
      {
        factor: 'Attendance Rate',
        value: overview.attendance !== null ? overview.attendance : null,
        weight: '20%',
        contribution: attendContrib,
        status: attendance >= 75 ? 'POSITIVE' : attendance >= 60 ? 'NEUTRAL' : 'ATTENTION',
        description: overview.attendance !== null
          ? `Class attendance is ${overview.attendance}%, contributing ${attendContrib} points to overall risk.`
          : 'No attendance records yet.'
      },
      {
        factor: 'Learning Progress',
        value: overview.learningProgress !== null ? overview.learningProgress : null,
        weight: '15%',
        contribution: progressContrib,
        status: progress >= 60 ? 'POSITIVE' : 'NEUTRAL',
        description: `Completed ${overview.metrics?.materialsCompleted || 0}/${overview.metrics?.materialsTotal || 0} syllabus materials.`
      },
      {
        factor: 'Discussion Engagement',
        value: overview.engagement !== null ? overview.engagement : null,
        weight: '10%',
        contribution: engagementContrib,
        status: engagement >= 40 ? 'POSITIVE' : 'NEUTRAL',
        description: `Collaborative forum engagement score is ${engagement}/100.`
      },
      {
        factor: 'Performance Trajectory',
        value: trendResult.change,
        weight: '10%',
        contribution: trendContrib,
        status: trendResult.trend === 'IMPROVING' ? 'POSITIVE' : trendResult.trend === 'DECLINING' ? 'ATTENTION' : 'NEUTRAL',
        description: trendResult.trend === 'IMPROVING'
          ? `Recent assessment trajectory shows positive improvement (+${trendResult.change}%).`
          : trendResult.trend === 'DECLINING'
          ? `Recent assessment trajectory indicates a downward trend (${trendResult.change}%).`
          : 'Recent performance trajectory is stable.'
      }
    ];

    let explanation = 'Academic metrics indicate steady progress.';
    if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
      explanation = 'Current academic indicators suggest increased attention and structured review would be beneficial.';
    } else if (riskLevel === 'MODERATE') {
      explanation = 'Performance is stable with targeted opportunities for improvement.';
    }

    return {
      riskScore,
      riskLevel,
      explanation,
      factors,
      trendAnalysis: trendResult
    };
  }
}

module.exports = RiskScoreService;
