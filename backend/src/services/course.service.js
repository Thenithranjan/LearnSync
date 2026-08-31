const Course = require('../models/Course');
const User = require('../models/User');

class CourseService {
  /**
   * Create a new course (Admin only)
   */
  static async createCourse(courseData, createdById) {
    const { title, description, code, department, faculty, thumbnail, status } = courseData;

    if (!title || !description || !code || !department) {
      const error = new Error('Title, description, course code, and department are required.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedCode = code.toUpperCase().trim();

    // Check duplicate course code
    const existingCourse = await Course.findOne({ code: normalizedCode });
    if (existingCourse) {
      const error = new Error(`Course code '${normalizedCode}' already exists.`);
      error.statusCode = 409;
      throw error;
    }

    // Verify assigned faculty if provided
    if (faculty) {
      const facultyUser = await User.findById(faculty);
      if (!facultyUser || facultyUser.role !== 'FACULTY') {
        const error = new Error('Assigned user must have the FACULTY role.');
        error.statusCode = 400;
        throw error;
      }
    }

    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      code: normalizedCode,
      department: department.trim(),
      faculty: faculty || null,
      thumbnail: thumbnail || '',
      status: status || 'DRAFT',
      createdBy: createdById
    });

    return await course.populate([
      { path: 'faculty', select: 'name email department profileImage' },
      { path: 'createdBy', select: 'name email role' }
    ]);
  }

  /**
   * Get list of courses based on user role and query parameters
   */
  static async getCourses(user, query = {}) {
    const filter = {};

    // Role-based visibility
    if (user.role === 'STUDENT') {
      filter.status = 'PUBLISHED';
    } else if (user.role === 'FACULTY') {
      filter.$or = [
        { faculty: user._id },
        { status: 'PUBLISHED' }
      ];
    }
    // ADMIN sees all courses

    if (query.department) {
      filter.department = query.department;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: searchRegex },
          { code: searchRegex },
          { description: searchRegex }
        ]
      });
    }

    return await Course.find(filter)
      .populate('faculty', 'name email department profileImage')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * Get courses assigned specifically to logged-in Faculty
   */
  static async getFacultyAssignedCourses(facultyUser) {
    if (facultyUser.role !== 'FACULTY' && facultyUser.role !== 'ADMIN') {
      const error = new Error('Access denied. Faculty role required.');
      error.statusCode = 403;
      throw error;
    }

    const filter = facultyUser.role === 'ADMIN' ? {} : { faculty: facultyUser._id };
    return await Course.find(filter)
      .populate('faculty', 'name email department profileImage')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * Get single course by ID
   */
  static async getCourseById(courseId, user) {
    const course = await Course.findById(courseId)
      .populate('faculty', 'name email department profileImage')
      .populate('createdBy', 'name email role');

    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    // Role visibility check for single course
    if (user.role === 'STUDENT' && course.status !== 'PUBLISHED') {
      const error = new Error('Course is not accessible.');
      error.statusCode = 403;
      throw error;
    }

    return course;
  }

  /**
   * Assign or unassign faculty to a course (Admin only)
   */
  static async assignFaculty(courseId, facultyId, user) {
    if (user.role !== 'ADMIN') {
      const error = new Error('Only ADMIN can assign faculty to courses.');
      error.statusCode = 403;
      throw error;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    if (facultyId) {
      const facultyUser = await User.findById(facultyId);
      if (!facultyUser || facultyUser.role !== 'FACULTY') {
        const error = new Error('Assigned user must exist and have the FACULTY role.');
        error.statusCode = 400;
        throw error;
      }
      course.faculty = facultyId;
    } else {
      course.faculty = null;
    }

    await course.save();

    return await course.populate([
      { path: 'faculty', select: 'name email department profileImage' },
      { path: 'createdBy', select: 'name email role' }
    ]);
  }

  /**
   * Update course details
   */
  static async updateCourse(courseId, updateData, user) {
    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    // Authorization check
    if (user.role !== 'ADMIN') {
      if (user.role === 'FACULTY' && String(course.faculty) !== String(user._id)) {
        const error = new Error('You are not authorized to update this course.');
        error.statusCode = 403;
        throw error;
      }
      if (user.role === 'STUDENT') {
        const error = new Error('Students are not authorized to update courses.');
        error.statusCode = 403;
        throw error;
      }
    }

    if (updateData.code && updateData.code.toUpperCase().trim() !== course.code) {
      const normalizedCode = updateData.code.toUpperCase().trim();
      const existing = await Course.findOne({ code: normalizedCode });
      if (existing) {
        const error = new Error(`Course code '${normalizedCode}' is already in use.`);
        error.statusCode = 409;
        throw error;
      }
      course.code = normalizedCode;
    }

    if (updateData.title) course.title = updateData.title.trim();
    if (updateData.description) course.description = updateData.description.trim();
    if (updateData.department) course.department = updateData.department.trim();
    if (updateData.thumbnail !== undefined) course.thumbnail = updateData.thumbnail;
    if (updateData.status) course.status = updateData.status;

    if (updateData.faculty !== undefined && user.role === 'ADMIN') {
      if (updateData.faculty) {
        const facultyUser = await User.findById(updateData.faculty);
        if (!facultyUser || facultyUser.role !== 'FACULTY') {
          const error = new Error('Assigned user must have FACULTY role.');
          error.statusCode = 400;
          throw error;
        }
        course.faculty = updateData.faculty;
      } else {
        course.faculty = null;
      }
    }

    await course.save();

    return await course.populate([
      { path: 'faculty', select: 'name email department profileImage' },
      { path: 'createdBy', select: 'name email role' }
    ]);
  }

  /**
   * Delete course (Admin only)
   */
  static async deleteCourse(courseId, user) {
    if (user.role !== 'ADMIN') {
      const error = new Error('Only ADMIN can delete courses.');
      error.statusCode = 403;
      throw error;
    }

    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    return true;
  }
}

module.exports = CourseService;
