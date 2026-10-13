const UserService = require('../services/user.service');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const CourseAnalyticsService = require('../services/analytics/courseAnalytics.service');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * Controller for User profile management endpoints.
 */
class UserController {
  /**
   * GET /api/users/profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getProfile(req.user._id);
      return sendSuccess(res, 200, 'Profile retrieved successfully', {
        user: user.toAuthJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, department, profileImage } = req.body;
      const updatedUser = await UserService.updateProfile(req.user._id, {
        name,
        department,
        profileImage
      });

      return sendSuccess(res, 200, 'Profile updated successfully', {
        user: updatedUser.toAuthJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  /**
  * GET /api/users?role=FACULTY&search=&page=&limit=
  * Admin-only directory listing (passwords never returned).
  */
  static async listUsers(req, res, next) {
    try {
      const { role, search, page, limit } = req.query;
      const query = {};
      if (role && ['ADMIN', 'FACULTY', 'STUDENT'].includes(String(role).toUpperCase())) {
        query.role = String(role).toUpperCase();
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ];
      }

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
      const skip = (pageNum - 1) * limitNum;

      const [total, users] = await Promise.all([
        User.countDocuments(query),
        User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean()
      ]);

      // Enrich faculty rows with live course, student and performance stats
      const data = await Promise.all(
        users.map(async (u) => {
          if (u.role !== 'FACULTY') return u;
          const facultyCourses = await Course.find({ faculty: u._id }).select('_id').lean();
          const courseIds = facultyCourses.map((c) => c._id);
          const studentsCount = courseIds.length
            ? await Enrollment.countDocuments({ courseId: { $in: courseIds }, status: 'ACTIVE' })
            : 0;
          // Average class performance across the faculty's courses
          let avgPerformance = null;
          if (courseIds.length) {
            const scores = [];
            await Promise.all(courseIds.slice(0, 10).map(async (courseId) => {
              try {
                const courseData = await CourseAnalyticsService.getCourseStudents(courseId);
                (courseData.students || []).forEach((s) => {
                  if (s.overallScore !== null && s.overallScore !== undefined) scores.push(s.overallScore);
                });
              } catch { /* skip courses with no computable data */ }
            }));
            if (scores.length) {
              avgPerformance = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
            }
          }
          return { ...u, coursesCount: courseIds.length, studentsCount, avgPerformance };
        })
      );

      return sendSuccess(res, 200, 'Users retrieved successfully', {
        data,
        pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) || 1 }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
