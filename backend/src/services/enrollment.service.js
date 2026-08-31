const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

class EnrollmentService {
  /**
   * Enroll logged in student into a course
   */
  static async enrollStudent(courseId, user) {
    if (user.role !== 'STUDENT' && user.role !== 'ADMIN') {
      const error = new Error('Only students can enroll in courses.');
      error.statusCode = 403;
      throw error;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    if (course.status !== 'PUBLISHED') {
      const error = new Error(`Cannot enroll in a course with status '${course.status}'. Course must be PUBLISHED.`);
      error.statusCode = 400;
      throw error;
    }

    // Check duplicate enrollment
    const existing = await Enrollment.findOne({ studentId: user._id, courseId });
    if (existing) {
      const error = new Error('You are already enrolled in this course.');
      error.statusCode = 409;
      throw error;
    }

    const enrollment = await Enrollment.create({
      studentId: user._id,
      courseId,
      status: 'ACTIVE'
    });

    return await enrollment.populate({
      path: 'courseId',
      populate: { path: 'faculty', select: 'name email department profileImage' }
    });
  }

  /**
   * Get enrolled courses for student
   */
  static async getStudentEnrolledCourses(user) {
    const enrollments = await Enrollment.find({ studentId: user._id, status: 'ACTIVE' })
      .populate({
        path: 'courseId',
        populate: [
          { path: 'faculty', select: 'name email department profileImage' },
          { path: 'createdBy', select: 'name email' }
        ]
      })
      .sort({ enrolledAt: -1 });

    return enrollments;
  }

  /**
   * Check enrollment status for a specific course
   */
  static async checkEnrollmentStatus(courseId, user) {
    const enrollment = await Enrollment.findOne({ studentId: user._id, courseId });
    return {
      isEnrolled: !!enrollment && enrollment.status === 'ACTIVE',
      enrollment: enrollment || null
    };
  }
}

module.exports = EnrollmentService;
