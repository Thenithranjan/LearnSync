const Recommendation = require('../../models/Recommendation');
const Material = require('../../models/Material');
const Module = require('../../models/Module');
const Assessment = require('../../models/Assessment');
const Enrollment = require('../../models/Enrollment');
const LearningGapService = require('./learningGap.service');

class RecommendationService {
  /**
   * Generate or retrieve personalized recommendations based on student learning gaps
   */
  static async getStudentRecommendations(studentId, courseId = null) {
    // 1. Fetch active pending recommendations from DB
    const query = { studentId, status: 'PENDING' };
    if (courseId) {
      query.courseId = courseId;
    }

    let existingRecs = await Recommendation.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // If active recommendations exist, return them (prevent spamming/regenerating on every render)
    if (existingRecs.length > 0) {
      return existingRecs;
    }

    // 2. Generate new recommendations from detected gaps
    const gapAnalysis = await LearningGapService.detectStudentGaps(studentId, courseId);
    const gaps = gapAnalysis.attentionTopics;

    if (!gaps.length) {
      return [];
    }

    const generated = [];

    for (const gap of gaps) {
      // Find matching published materials for this topic/course
      const materialQuery = { isPublished: true };
      if (gap.courseId) {
        const modules = await Module.find({ courseId: gap.courseId }).select('_id').lean();
        materialQuery.moduleId = { $in: modules.map((m) => m._id) };
      }

      // Search by topic field or title match
      const relatedMaterial = await Material.findOne({
        ...materialQuery,
        $or: [
          { topic: { $regex: gap.topic, $options: 'i' } },
          { title: { $regex: gap.topic, $options: 'i' } }
        ]
      }).lean();

      // Find related quiz for practice
      const relatedQuiz = await Assessment.findOne({
        type: 'QUIZ',
        isPublished: true,
        ...(gap.courseId ? { courseId: gap.courseId } : {}),
        'questions.topic': { $regex: gap.topic, $options: 'i' }
      }).lean();

      let targetCourseId = gap.courseId;
      if (!targetCourseId && relatedMaterial) {
        const mod = await Module.findById(relatedMaterial.moduleId).lean();
        if (mod) targetCourseId = mod.courseId;
      }
      if (!targetCourseId && relatedQuiz) {
        targetCourseId = relatedQuiz.courseId;
      }
      if (!targetCourseId) {
        const enr = await Enrollment.findOne({ studentId, status: 'ACTIVE' }).lean();
        if (enr) targetCourseId = enr.courseId;
      }

      let priority = 'MEDIUM';
      if (gap.accuracy < 40) priority = 'HIGH';
      else if (gap.accuracy >= 60) priority = 'LOW';

      // 1. Material Review Recommendation
      if (relatedMaterial) {
        generated.push({
          studentId,
          courseId: targetCourseId,
          topic: gap.topic,
          type: 'MATERIAL',
          title: `Review Learning Material: ${relatedMaterial.title}`,
          description: `Strengthen core concepts in ${gap.topic} by reviewing this lecture/document material.`,
          targetId: relatedMaterial._id,
          targetUrl: relatedMaterial.url || '',
          priority,
          reason: `Recent topic accuracy in ${gap.topic} is ${gap.accuracy}%.`,
          status: 'PENDING'
        });
      } else {
        generated.push({
          studentId,
          courseId: targetCourseId,
          topic: gap.topic,
          type: 'REVIEW',
          title: `Study Session: ${gap.topic} Mastery`,
          description: `Review notes and syllabus examples on ${gap.topic} to prepare for upcoming evaluations.`,
          priority,
          reason: `Topic accuracy is ${gap.accuracy}%.`,
          status: 'PENDING'
        });
      }

      // 2. Practice Recommendation
      if (relatedQuiz) {
        generated.push({
          studentId,
          courseId: targetCourseId,
          topic: gap.topic,
          type: 'PRACTICE',
          title: `Practice Concept: ${gap.topic} Quiz`,
          description: `Test and solidify your understanding by attempting practice problems in ${relatedQuiz.title}.`,
          targetId: relatedQuiz._id,
          priority,
          reason: `Reinforce concepts in ${gap.topic} through active retrieval.`,
          status: 'PENDING'
        });
      }
    }

    // Limit to top 5 recommendations by priority
    const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    generated.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const topRecs = generated.slice(0, 5);

    // Save newly generated recommendations to DB (avoid duplicate records)
    const savedRecs = [];
    for (const rec of topRecs) {
      const created = await Recommendation.create(rec);
      savedRecs.push(created.toObject());
    }

    return savedRecs;
  }

  /**
   * Mark recommendation as completed
   */
  static async completeRecommendation(recommendationId, studentId) {
    const rec = await Recommendation.findOne({ _id: recommendationId, studentId });
    if (!rec) {
      const error = new Error('Recommendation not found');
      error.statusCode = 404;
      throw error;
    }

    rec.status = 'COMPLETED';
    rec.completedAt = new Date();
    await rec.save();
    return rec;
  }

  /**
   * Dismiss recommendation
   */
  static async dismissRecommendation(recommendationId, studentId) {
    const rec = await Recommendation.findOne({ _id: recommendationId, studentId });
    if (!rec) {
      const error = new Error('Recommendation not found');
      error.statusCode = 404;
      throw error;
    }

    rec.status = 'DISMISSED';
    await rec.save();
    return rec;
  }
}

module.exports = RecommendationService;
