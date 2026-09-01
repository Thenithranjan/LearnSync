const Intervention = require('../../models/Intervention');
const Recommendation = require('../../models/Recommendation');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');
const TopicAnalyticsService = require('../analytics/topicAnalytics.service');
const InterventionOutcome = require('../../models/InterventionOutcome');
const { isValidStatusTransition } = require('./intervention.utils');

class InterventionService {
  /**
   * Create a new intervention manually or from Module 7 recommendations
   */
  static async createIntervention(data, creatorUser) {
    const {
      studentId,
      courseId,
      topic,
      title,
      description,
      actionType,
      priority,
      dueDate,
      sourceType,
      sourceId,
      parentInterventionId
    } = data;

    // Verify course exists
    const course = await Course.findById(courseId).lean();
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify student is enrolled in course
    const enrollment = await Enrollment.findOne({ studentId, courseId, status: 'ACTIVE' }).lean();
    if (!enrollment) {
      const error = new Error('Student is not actively enrolled in this course.');
      error.statusCode = 400;
      throw error;
    }

    // Duplicate Prevention: Check if active intervention exists for same student, course, topic, and actionType
    const duplicate = await Intervention.findOne({
      studentId,
      courseId,
      topic,
      actionType,
      status: { $in: ['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS'] }
    }).lean();

    if (duplicate) {
      const error = new Error(`An active intervention for topic "${topic}" and action "${actionType}" already exists for this student.`);
      error.statusCode = 409;
      throw error;
    }

    // Determine assigned faculty (creator if faculty, or course's assigned faculty)
    let assignedFaculty = creatorUser._id;
    if (creatorUser.role === 'ADMIN' && course.facultyId) {
      assignedFaculty = course.facultyId;
    }

    const intervention = await Intervention.create({
      studentId,
      courseId,
      createdBy: creatorUser._id,
      assignedFaculty,
      topic,
      title,
      description: description || '',
      actionType: actionType || 'PRACTICE_TASK',
      priority: priority || 'MEDIUM',
      dueDate: new Date(dueDate),
      sourceType: sourceType || 'FACULTY_MANUAL',
      sourceId: sourceId || null,
      parentInterventionId: parentInterventionId || null,
      status: 'ASSIGNED'
    });

    // Record baseline performance for topic
    try {
      const topicStats = await TopicAnalyticsService.getStudentTopicAnalytics(studentId, courseId);
      const matched = topicStats.find((t) => t.topic.toLowerCase() === topic.toLowerCase());
      const beforeScore = matched && matched.accuracy !== null ? matched.accuracy : 50;

      await InterventionOutcome.create({
        interventionId: intervention._id,
        studentId,
        courseId,
        topic,
        beforeScore,
        measurementStatus: 'PENDING'
      });
    } catch (e) {
      console.warn('Baseline outcome recording warning:', e.message);
    }

    return intervention;
  }

  /**
   * Create intervention from a Module 7 study recommendation
   */
  static async createFromRecommendation(recommendationId, facultyUser, overrideData = {}) {
    const rec = await Recommendation.findById(recommendationId).lean();
    if (!rec) {
      const error = new Error('Recommendation not found');
      error.statusCode = 404;
      throw error;
    }

    // Map recommendation action type
    let actionType = 'PRACTICE_TASK';
    if (rec.type === 'MATERIAL') actionType = 'LEARNING_MATERIAL';
    else if (rec.type === 'FACULTY_SUPPORT') actionType = 'DOUBT_SESSION';
    else if (rec.type === 'REVIEW') actionType = 'STUDY_PLAN';

    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 7); // 7 days default

    const payload = {
      studentId: rec.studentId,
      courseId: rec.courseId,
      topic: rec.topic,
      title: overrideData.title || rec.title,
      description: overrideData.description || rec.description || rec.reason,
      actionType: overrideData.actionType || actionType,
      priority: overrideData.priority || rec.priority || 'MEDIUM',
      dueDate: overrideData.dueDate || defaultDueDate,
      sourceType: 'RECOMMENDATION',
      sourceId: rec._id
    };

    const intervention = await InterventionService.createIntervention(payload, facultyUser);

    // Update recommendation status to completed / converted
    await Recommendation.findByIdAndUpdate(recommendationId, { status: 'COMPLETED', completedAt: new Date() });

    return intervention;
  }

  /**
   * Get intervention by ID with role check
   */
  static async getInterventionById(id, requestingUser) {
    const intervention = await Intervention.findById(id)
      .populate('studentId', 'name email department profileImage')
      .populate('assignedFaculty', 'name email department')
      .populate('courseId', 'title code')
      .lean();

    if (!intervention) {
      const error = new Error('Intervention not found');
      error.statusCode = 404;
      throw error;
    }

    // Role Security
    if (requestingUser.role === 'STUDENT' && intervention.studentId._id.toString() !== requestingUser._id.toString()) {
      const error = new Error('Access denied. You can only view your own interventions.');
      error.statusCode = 403;
      throw error;
    }

    return intervention;
  }

  /**
   * Student acknowledges intervention
   */
  static async acknowledgeIntervention(id, studentId) {
    const intervention = await Intervention.findOne({ _id: id, studentId });
    if (!intervention) {
      const error = new Error('Intervention not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    if (!isValidStatusTransition(intervention.status, 'ACKNOWLEDGED')) {
      const error = new Error(`Cannot transition intervention from ${intervention.status} to ACKNOWLEDGED`);
      error.statusCode = 400;
      throw error;
    }

    intervention.status = 'ACKNOWLEDGED';
    await intervention.save();
    return intervention;
  }

  /**
   * Student starts intervention
   */
  static async startIntervention(id, studentId) {
    const intervention = await Intervention.findOne({ _id: id, studentId });
    if (!intervention) {
      const error = new Error('Intervention not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    if (!isValidStatusTransition(intervention.status, 'IN_PROGRESS')) {
      const error = new Error(`Cannot transition intervention from ${intervention.status} to IN_PROGRESS`);
      error.statusCode = 400;
      throw error;
    }

    intervention.status = 'IN_PROGRESS';
    if (!intervention.startedAt) intervention.startedAt = new Date();
    await intervention.save();
    return intervention;
  }

  /**
   * Student completes intervention action
   */
  static async completeIntervention(id, studentId, studentResponse = '') {
    const intervention = await Intervention.findOne({ _id: id, studentId });
    if (!intervention) {
      const error = new Error('Intervention not found or unauthorized');
      error.statusCode = 404;
      throw error;
    }

    if (!isValidStatusTransition(intervention.status, 'COMPLETED')) {
      const error = new Error(`Cannot transition intervention from ${intervention.status} to COMPLETED`);
      error.statusCode = 400;
      throw error;
    }

    intervention.status = 'COMPLETED';
    intervention.completedAt = new Date();
    if (studentResponse) intervention.studentResponse = studentResponse.trim();
    await intervention.save();
    return intervention;
  }

  /**
   * Faculty reviews completed intervention and submits feedback & outcome
   */
  static async reviewIntervention(id, facultyUser, { facultyNotes = '', outcome }) {
    const intervention = await Intervention.findById(id);
    if (!intervention) {
      const error = new Error('Intervention not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify faculty owns course
    if (facultyUser.role === 'FACULTY' && intervention.assignedFaculty.toString() !== facultyUser._id.toString()) {
      const error = new Error('Access denied. You can only review interventions in your assigned courses.');
      error.statusCode = 403;
      throw error;
    }

    const validOutcomes = ['IMPROVED', 'PARTIALLY_IMPROVED', 'NO_SIGNIFICANT_CHANGE', 'FURTHER_SUPPORT_REQUIRED', 'NOT_COMPLETED'];
    if (!validOutcomes.includes(outcome)) {
      const error = new Error(`Invalid outcome: ${outcome}. Must be one of ${validOutcomes.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    intervention.status = 'REVIEWED';
    intervention.reviewedAt = new Date();
    intervention.facultyNotes = facultyNotes ? facultyNotes.trim() : '';
    intervention.outcome = outcome;
    await intervention.save();
    return intervention;
  }

  /**
   * Filtered intervention list with role access restrictions and pagination
   */
  static async getInterventions(requestingUser, filters = {}, pagination = {}) {
    const page = parseInt(pagination.page, 10) || 1;
    const limit = parseInt(pagination.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (requestingUser.role === 'STUDENT') {
      query.studentId = requestingUser._id;
    } else if (requestingUser.role === 'FACULTY') {
      if (filters.courseId) {
        query.courseId = filters.courseId;
      } else {
        const assignedCourses = await Course.find({ facultyId: requestingUser._id }).select('_id').lean();
        query.courseId = { $in: assignedCourses.map((c) => c._id) };
      }
    } else if (filters.courseId) {
      query.courseId = filters.courseId;
    }

    if (filters.studentId && requestingUser.role !== 'STUDENT') {
      query.studentId = filters.studentId;
    }
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.actionType) query.actionType = filters.actionType;
    if (filters.topic) query.topic = { $regex: filters.topic, $options: 'i' };

    // Check overdue status on fetch
    const now = new Date();
    await Intervention.updateMany(
      { status: { $in: ['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS'] }, dueDate: { $lt: now } },
      { status: 'OVERDUE' }
    );

    const [total, data] = await Promise.all([
      Intervention.countDocuments(query),
      Intervention.find(query)
        .populate('studentId', 'name email department profileImage')
        .populate('assignedFaculty', 'name email department')
        .populate('courseId', 'title code')
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }
}

module.exports = InterventionService;
