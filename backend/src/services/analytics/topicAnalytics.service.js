const Assessment = require('../../models/Assessment');
const Submission = require('../../models/Submission');
const Module = require('../../models/Module');
const { safePercentage } = require('./analytics.utils');

class TopicAnalyticsService {
  /**
   * Calculate topic-wise performance for a student (across all or a specific course)
   */
  static async getStudentTopicAnalytics(studentId, courseId = null) {
    const assessmentQuery = { type: 'QUIZ', isPublished: true };
    if (courseId) {
      assessmentQuery.courseId = courseId;
    }

    const quizzes = await Assessment.find(assessmentQuery)
      .populate('moduleId', 'title')
      .lean();

    if (!quizzes.length) {
      return [];
    }

    const quizIds = quizzes.map((q) => q._id);
    const submissions = await Submission.find({
      studentId,
      assessmentId: { $in: quizIds },
      status: 'GRADED'
    }).lean();

    const submissionMap = new Map();
    submissions.forEach((sub) => {
      // Use best attempt if multiple (higher score or latest)
      const existing = submissionMap.get(sub.assessmentId.toString());
      if (!existing || (sub.percentage || 0) > (existing.percentage || 0)) {
        submissionMap.set(sub.assessmentId.toString(), sub);
      }
    });

    const topicStats = {};

    quizzes.forEach((quiz) => {
      const sub = submissionMap.get(quiz._id.toString());
      if (!sub || !Array.isArray(sub.answers)) return;

      quiz.questions.forEach((q, idx) => {
        const studentAns = sub.answers.find((a) => a.questionIndex === idx);
        if (!studentAns) return;

        // Resolve topic: question.topic -> module title -> quiz title
        const rawTopic = (q.topic && q.topic.trim()) ||
          (quiz.moduleId && quiz.moduleId.title) ||
          quiz.title ||
          'General Concepts';
        const topicName = rawTopic.trim();

        if (!topicStats[topicName]) {
          topicStats[topicName] = {
            topic: topicName,
            questionsAttempted: 0,
            correctAnswers: 0,
            totalPointsPossible: 0,
            totalPointsEarned: 0
          };
        }

        topicStats[topicName].questionsAttempted += 1;
        if (studentAns.isCorrect) {
          topicStats[topicName].correctAnswers += 1;
        }
        topicStats[topicName].totalPointsPossible += (q.points || 1);
        topicStats[topicName].totalPointsEarned += (studentAns.pointsEarned || 0);
      });
    });

    const result = Object.values(topicStats).map((stat) => {
      const accuracy = safePercentage(stat.correctAnswers, stat.questionsAttempted);
      return {
        topic: stat.topic,
        accuracy: accuracy !== null ? accuracy : 0,
        questionsAttempted: stat.questionsAttempted,
        correctAnswers: stat.correctAnswers,
        totalPointsPossible: stat.totalPointsPossible,
        totalPointsEarned: stat.totalPointsEarned
      };
    });

    // Sort by questions attempted / accuracy
    result.sort((a, b) => b.questionsAttempted - a.questionsAttempted || b.accuracy - a.accuracy);
    return result;
  }

  /**
   * Calculate topic-wise performance for an entire course (Faculty / Class view)
   */
  static async getCourseTopicAnalytics(courseId) {
    const quizzes = await Assessment.find({
      courseId,
      type: 'QUIZ',
      isPublished: true
    })
      .populate('moduleId', 'title')
      .lean();

    if (!quizzes.length) {
      return [];
    }

    const quizIds = quizzes.map((q) => q._id);
    const submissions = await Submission.find({
      assessmentId: { $in: quizIds },
      status: 'GRADED'
    }).lean();

    const topicStats = {};

    quizzes.forEach((quiz) => {
      const quizSubmissions = submissions.filter(
        (s) => s.assessmentId.toString() === quiz._id.toString()
      );

      quizSubmissions.forEach((sub) => {
        if (!Array.isArray(sub.answers)) return;

        quiz.questions.forEach((q, idx) => {
          const studentAns = sub.answers.find((a) => a.questionIndex === idx);
          if (!studentAns) return;

          const rawTopic = (q.topic && q.topic.trim()) ||
            (quiz.moduleId && quiz.moduleId.title) ||
            quiz.title ||
            'General Concepts';
          const topicName = rawTopic.trim();

          if (!topicStats[topicName]) {
            topicStats[topicName] = {
              topic: topicName,
              questionsAttempted: 0,
              correctAnswers: 0,
              totalPointsPossible: 0,
              totalPointsEarned: 0
            };
          }

          topicStats[topicName].questionsAttempted += 1;
          if (studentAns.isCorrect) {
            topicStats[topicName].correctAnswers += 1;
          }
          topicStats[topicName].totalPointsPossible += (q.points || 1);
          topicStats[topicName].totalPointsEarned += (studentAns.pointsEarned || 0);
        });
      });
    });

    const result = Object.values(topicStats).map((stat) => {
      const accuracy = safePercentage(stat.correctAnswers, stat.questionsAttempted);
      return {
        topic: stat.topic,
        accuracy: accuracy !== null ? accuracy : 0,
        questionsAttempted: stat.questionsAttempted,
        correctAnswers: stat.correctAnswers,
        totalPointsPossible: stat.totalPointsPossible,
        totalPointsEarned: stat.totalPointsEarned
      };
    });

    result.sort((a, b) => b.questionsAttempted - a.questionsAttempted || b.accuracy - a.accuracy);
    return result;
  }
}

module.exports = TopicAnalyticsService;
