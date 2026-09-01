const TopicAnalyticsService = require('../analytics/topicAnalytics.service');
const LearningGap = require('../../models/LearningGap');
const {
  getTopicSeverity,
  getEvidenceLevel,
  TOPIC_THRESHOLDS,
  MIN_QUESTIONS_FOR_EVIDENCE
} = require('./intelligence.utils');

class LearningGapService {
  /**
   * Detect and persist/sync evidence-based learning gaps for a student
   */
  static async detectStudentGaps(studentId, courseId = null) {
    const rawTopics = await TopicAnalyticsService.getStudentTopicAnalytics(studentId, courseId);

    const detectedGaps = [];
    const strongTopics = [];
    const developingTopics = [];
    const attentionTopics = [];

    for (const item of rawTopics) {
      const accuracy = item.accuracy !== null ? item.accuracy : 0;
      const questionsAttempted = item.questionsAttempted || 0;
      const correctAnswers = item.correctAnswers || 0;
      const incorrectAnswers = Math.max(0, questionsAttempted - correctAnswers);

      const severity = getTopicSeverity(accuracy, questionsAttempted);
      const evidenceLevel = getEvidenceLevel(questionsAttempted);

      // Build structured evidence items
      const evidence = [
        {
          type: 'ACCURACY',
          description: `Topic accuracy is ${accuracy}% (${correctAnswers}/${questionsAttempted} correct answers)`,
          value: accuracy
        },
        {
          type: 'QUESTIONS_COUNT',
          description: `${questionsAttempted} total assessment questions attempted on this topic`,
          value: questionsAttempted
        }
      ];

      if (incorrectAnswers > 0) {
        evidence.push({
          type: 'RECENT_ERRORS',
          description: `${incorrectAnswers} incorrect answers recorded during recent quiz evaluations`,
          value: incorrectAnswers
        });
      }

      if (questionsAttempted < MIN_QUESTIONS_FOR_EVIDENCE) {
        evidence.push({
          type: 'QUESTIONS_COUNT',
          description: `Minimum of ${MIN_QUESTIONS_FOR_EVIDENCE} questions required for statistically reliable mastery assessment`,
          value: questionsAttempted
        });
      }

      const gapPayload = {
        studentId,
        courseId: courseId || null,
        topic: item.topic,
        accuracy,
        questionsAttempted,
        severity: severity || 'LOW',
        evidenceLevel,
        evidence
      };

      if (severity && severity !== 'INSUFFICIENT_DATA') {
        attentionTopics.push(gapPayload);
        detectedGaps.push(gapPayload);
      } else if (questionsAttempted >= MIN_QUESTIONS_FOR_EVIDENCE) {
        if (accuracy >= TOPIC_THRESHOLDS.strong) {
          strongTopics.push(gapPayload);
        } else {
          developingTopics.push(gapPayload);
        }
      }
    }

    return {
      gaps: detectedGaps,
      attentionTopics,
      developingTopics,
      strongTopics,
      allTopics: rawTopics
    };
  }

  /**
   * Identify class-level topic attention areas for a course
   */
  static async detectCourseAttentionTopics(courseId) {
    const courseTopics = await TopicAnalyticsService.getCourseTopicAnalytics(courseId);

    const attentionAreas = [];
    const strongAreas = [];
    const developingAreas = [];

    courseTopics.forEach((item) => {
      const accuracy = item.accuracy !== null ? item.accuracy : 0;
      const questionsAttempted = item.questionsAttempted || 0;

      const evidenceLevel = getEvidenceLevel(questionsAttempted);

      const topicSummary = {
        topic: item.topic,
        averageAccuracy: accuracy,
        questionsAttempted,
        evidenceLevel,
        evidence: [
          {
            type: 'ACCURACY',
            description: `Class average accuracy is ${accuracy}% across all student attempts`,
            value: accuracy
          },
          {
            type: 'QUESTIONS_COUNT',
            description: `${questionsAttempted} cumulative questions answered by students in this course`,
            value: questionsAttempted
          }
        ]
      };

      if (accuracy < TOPIC_THRESHOLDS.developing) {
        topicSummary.status = accuracy < TOPIC_THRESHOLDS.needsImprovement ? 'HIGH_ATTENTION' : 'MODERATE_ATTENTION';
        attentionAreas.push(topicSummary);
      } else if (accuracy >= TOPIC_THRESHOLDS.strong) {
        topicSummary.status = 'STRONG';
        strongAreas.push(topicSummary);
      } else {
        topicSummary.status = 'DEVELOPING';
        developingAreas.push(topicSummary);
      }
    });

    return {
      attentionAreas,
      developingAreas,
      strongAreas,
      courseTopics
    };
  }
}

module.exports = LearningGapService;
