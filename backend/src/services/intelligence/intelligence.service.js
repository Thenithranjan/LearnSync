const StudentAnalyticsService = require('../analytics/studentAnalytics.service');
const Course = require('../../models/Course');
const User = require('../../models/User');
const LearningGapService = require('./learningGap.service');
const RiskScoreService = require('./riskScore.service');
const RecommendationService = require('./recommendation.service');
const EarlyWarningService = require('./earlyWarning.service');

class IntelligenceService {
  /**
   * Unify all intelligence components for student dashboard
   */
  static async getStudentIntelligenceOverview(studentId, courseId = null) {
    const [overview, risk, gaps, recommendations] = await Promise.all([
      StudentAnalyticsService.getStudentOverview(studentId, { courseId }),
      RiskScoreService.calculateStudentRisk(studentId, courseId),
      LearningGapService.detectStudentGaps(studentId, courseId),
      RecommendationService.getStudentRecommendations(studentId, courseId)
    ]);

    return {
      overallPerformance: overview.overallScore,
      risk,
      learningGaps: gaps.gaps,
      attentionTopics: gaps.attentionTopics,
      developingTopics: gaps.developingTopics,
      strongTopics: gaps.strongTopics,
      recommendations,
      trend: risk.trendAnalysis?.trend || 'STABLE',
      metrics: overview.metrics
    };
  }

  /**
   * Get institution-wide academic intelligence for admins
   */
  static async getAdminIntelligenceOverview() {
    const totalStudents = await User.countDocuments({ role: 'STUDENT', isActive: true });
    const students = await User.find({ role: 'STUDENT', isActive: true }).select('_id name department').lean();

    const riskSummary = {
      CRITICAL: 0,
      HIGH: 0,
      MODERATE: 0,
      LOW: 0,
      INSUFFICIENT_DATA: 0
    };

    let totalRiskScores = 0;
    let validRiskScoresCount = 0;

    for (const s of students) {
      const riskAnalysis = await RiskScoreService.calculateStudentRisk(s._id);
      const level = riskAnalysis.riskLevel || 'INSUFFICIENT_DATA';
      if (riskSummary[level] !== undefined) {
        riskSummary[level]++;
      }
      if (riskAnalysis.riskScore !== null) {
        totalRiskScores += riskAnalysis.riskScore;
        validRiskScoresCount++;
      }
    }

    const avgRiskScore = validRiskScoresCount > 0
      ? Number((totalRiskScores / validRiskScoresCount).toFixed(1))
      : null;

    // Collect all published courses for topic analysis
    const courses = await Course.find({ status: 'PUBLISHED' }).select('_id title').lean();
    const commonAttentionTopicsMap = new Map();

    for (const c of courses) {
      const courseGaps = await LearningGapService.detectCourseAttentionTopics(c._id);
      courseGaps.attentionAreas.forEach((area) => {
        const existing = commonAttentionTopicsMap.get(area.topic);
        if (!existing) {
          commonAttentionTopicsMap.set(area.topic, {
            topic: area.topic,
            coursesAffected: 1,
            averageAccuracy: area.averageAccuracy,
            totalQuestions: area.questionsAttempted
          });
        } else {
          existing.coursesAffected++;
          existing.averageAccuracy = Number(((existing.averageAccuracy + area.averageAccuracy) / 2).toFixed(1));
          existing.totalQuestions += area.questionsAttempted;
        }
      });
    }

    const commonAttentionTopics = Array.from(commonAttentionTopicsMap.values());
    commonAttentionTopics.sort((a, b) => a.averageAccuracy - b.averageAccuracy);

    return {
      totalStudents,
      averageRiskScore: avgRiskScore,
      riskSummary,
      commonAttentionTopics: commonAttentionTopics.slice(0, 8)
    };
  }
}

module.exports = IntelligenceService;
