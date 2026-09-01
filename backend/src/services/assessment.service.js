const Assessment = require('../models/Assessment');
const Course = require('../models/Course');

class AssessmentService {
  /**
   * Create an Assessment (Assignment or Quiz)
   */
  static async createAssessment(facultyId, courseId, data) {
    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    // If it's a quiz, calculate total points from questions if not explicitly specified
    let totalPoints = data.totalPoints || 100;
    if (data.type === 'QUIZ' && Array.isArray(data.questions) && data.questions.length > 0) {
      totalPoints = data.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    }

    const assessment = await Assessment.create({
      ...data,
      courseId,
      facultyId,
      totalPoints
    });

    return assessment;
  }

  /**
   * Get all assessments for a course
   * Strips correct answers for students
   */
  static async getCourseAssessments(courseId, userRole) {
    const assessments = await Assessment.find({ courseId, isPublished: true })
      .populate('facultyId', 'name email')
      .sort({ createdAt: -1 });

    if (userRole === 'STUDENT') {
      return assessments.map((assessment) => {
        const item = assessment.toObject();
        if (item.questions) {
          item.questions = item.questions.map((q) => {
            const { correctOptionIndex, explanation, ...rest } = q;
            return rest;
          });
        }
        return item;
      });
    }

    return assessments;
  }

  /**
   * Get single assessment by ID
   */
  static async getAssessmentById(assessmentId, userRole) {
    const assessment = await Assessment.findById(assessmentId)
      .populate('courseId', 'title code faculty')
      .populate('facultyId', 'name email');

    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole === 'STUDENT') {
      const item = assessment.toObject();
      if (item.questions) {
        item.questions = item.questions.map((q) => {
          const { correctOptionIndex, explanation, ...rest } = q;
          return rest;
        });
      }
      return item;
    }

    return assessment;
  }

  /**
   * Update assessment (Faculty/Admin)
   */
  static async updateAssessment(assessmentId, facultyId, userRole, data) {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'ADMIN' && assessment.facultyId.toString() !== facultyId.toString()) {
      const error = new Error('You are not authorized to update this assessment');
      error.statusCode = 403;
      throw error;
    }

    if (data.type === 'QUIZ' && Array.isArray(data.questions) && data.questions.length > 0) {
      data.totalPoints = data.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    }

    Object.assign(assessment, data);
    await assessment.save();
    return assessment;
  }

  /**
   * Delete assessment
   */
  static async deleteAssessment(assessmentId, facultyId, userRole) {
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'ADMIN' && assessment.facultyId.toString() !== facultyId.toString()) {
      const error = new Error('You are not authorized to delete this assessment');
      error.statusCode = 403;
      throw error;
    }

    await Assessment.findByIdAndDelete(assessmentId);
    return { message: 'Assessment deleted successfully' };
  }
}

module.exports = AssessmentService;
