const Course = require('../../models/Course');
const CourseAnalyticsService = require('../analytics/courseAnalytics.service');
const RiskScoreService = require('./riskScore.service');
const LearningGapService = require('./learningGap.service');

class EarlyWarningService {
  /**
   * Get faculty early warning list of students in a course who may benefit from extra support
   */
  static async getCourseEarlyWarnings(courseId) {
    const course = await Course.findById(courseId).lean();
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    const studentData = await CourseAnalyticsService.getCourseStudents(courseId);
    const students = studentData.students || [];

    const earlyWarnings = [];
    const riskCounts = {
      CRITICAL: 0,
      HIGH: 0,
      MODERATE: 0,
      LOW: 0,
      INSUFFICIENT_DATA: 0
    };

    for (const student of students) {
      const riskAnalysis = await RiskScoreService.calculateStudentRisk(student.studentId, courseId);
      const gapAnalysis = await LearningGapService.detectStudentGaps(student.studentId, courseId);

      const level = riskAnalysis.riskLevel || 'INSUFFICIENT_DATA';
      if (riskCounts[level] !== undefined) {
        riskCounts[level]++;
      }

      // Identify flag reasons
      const flags = [];
      if (student.attendance !== null && student.attendance < 75) {
        flags.push(`Low Attendance (${student.attendance}%)`);
      }
      if (student.quizPerformance !== null && student.quizPerformance < 60) {
        flags.push(`Low Quiz Performance (${student.quizPerformance}%)`);
      }
      if (student.assignmentPerformance !== null && student.assignmentPerformance < 60) {
        flags.push(`Low Assignment Marks (${student.assignmentPerformance}%)`);
      }
      if (riskAnalysis.trendAnalysis?.trend === 'DECLINING') {
        flags.push('Declining Assessment Trajectory');
      }
      if (gapAnalysis.attentionTopics.length >= 2) {
        flags.push(`Multiple Concept Gaps (${gapAnalysis.attentionTopics.length} topics)`);
      }

      // Actionable faculty suggestions
      const suggestedActions = [];
      if (gapAnalysis.attentionTopics.length > 0) {
        const topTopic = gapAnalysis.attentionTopics[0].topic;
        suggestedActions.push(`Review student's recent submissions on ${topTopic}`);
        suggestedActions.push(`Assign targeted practice exercises for ${topTopic}`);
      }
      if (student.attendance !== null && student.attendance < 75) {
        suggestedActions.push('Send attendance check-in reminder');
      }
      if (suggestedActions.length === 0) {
        suggestedActions.push('Schedule academic mentoring check-in');
      }

      const isAtRisk = level === 'HIGH' || level === 'CRITICAL' || level === 'MODERATE' || flags.length > 0;

      if (isAtRisk) {
        earlyWarnings.push({
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          department: student.department,
          profileImage: student.profileImage,
          riskScore: riskAnalysis.riskScore,
          riskLevel: riskAnalysis.riskLevel,
          overallPerformance: student.overallScore,
          attendance: student.attendance,
          quizPerformance: student.quizPerformance,
          assignmentPerformance: student.assignmentPerformance,
          trend: riskAnalysis.trendAnalysis?.trend || 'STABLE',
          flags,
          attentionTopics: gapAnalysis.attentionTopics.map((g) => ({
            topic: g.topic,
            accuracy: g.accuracy,
            severity: g.severity
          })),
          suggestedActions
        });
      }
    }

    // Sort by risk score descending
    earlyWarnings.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

    return {
      courseId,
      courseTitle: course.title,
      courseCode: course.code,
      totalStudents: students.length,
      riskSummary: riskCounts,
      earlyWarnings
    };
  }
}

module.exports = EarlyWarningService;
