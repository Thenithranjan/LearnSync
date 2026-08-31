const CourseService = require('../services/course.service');
const { sendSuccess } = require('../utils/apiResponse');

class CourseController {
  /**
   * POST /api/courses
   */
  static async create(req, res, next) {
    try {
      const course = await CourseService.createCourse(req.body, req.user._id);
      return sendSuccess(res, 201, 'Course created successfully', { course });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courses
   */
  static async getAll(req, res, next) {
    try {
      const courses = await CourseService.getCourses(req.user, req.query);
      return sendSuccess(res, 200, 'Courses retrieved successfully', { courses });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courses/:id
   */
  static async getById(req, res, next) {
    try {
      const course = await CourseService.getCourseById(req.params.id, req.user);
      return sendSuccess(res, 200, 'Course details retrieved successfully', { course });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/courses/:id
   */
  static async update(req, res, next) {
    try {
      const course = await CourseService.updateCourse(req.params.id, req.body, req.user);
      return sendSuccess(res, 200, 'Course updated successfully', { course });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/courses/:id
   */
  static async delete(req, res, next) {
    try {
      await CourseService.deleteCourse(req.params.id, req.user);
      return sendSuccess(res, 200, 'Course deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CourseController;
