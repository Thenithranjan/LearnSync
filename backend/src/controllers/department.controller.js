const Department = require('../models/Department');
const AdminAnalyticsService = require('../services/analytics/adminAnalytics.service');
const { sendSuccess } = require('../utils/apiResponse');

class DepartmentController {
  /**
   * GET /api/departments
   * Explicit departments merged with live stats, plus any department names
   * found on users/courses that have no explicit record yet.
   */
  static async list(req, res, next) {
    try {
      const [managed, stats] = await Promise.all([
        Department.find({}).sort({ name: 1 }).lean(),
        AdminAnalyticsService.getDepartmentAnalytics()
      ]);

      const statsByName = new Map(stats.map((s) => [s.department, s]));
      const data = managed.map((d) => ({
        ...(statsByName.get(d.name) || {
          department: d.name,
          studentCount: 0,
          courseCount: 0,
          averagePerformance: null,
          averageAttendance: null
        }),
        _id: d._id,
        code: d.code,
        description: d.description,
        isManaged: true,
        isActive: d.isActive
      }));

      // Departments that only exist as free-text on users/courses
      stats.forEach((s) => {
        if (!managed.some((d) => d.name === s.department)) {
          data.push({ ...s, code: '', description: '', isManaged: false });
        }
      });

      return sendSuccess(res, 200, 'Departments retrieved successfully', { data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/departments
   */
  static async create(req, res, next) {
    try {
      const { name, code, description, headOfDepartment } = req.body;
      if (!name || !name.trim()) {
        const error = new Error('Department name is required');
        error.statusCode = 400;
        throw error;
      }
      const existing = await Department.findOne({ name: name.trim() });
      if (existing) {
        const error = new Error(`Department "${name.trim()}" already exists`);
        error.statusCode = 409;
        throw error;
      }
      const department = await Department.create({
        name: name.trim(),
        code: (code || '').trim().toUpperCase(),
        description: (description || '').trim(),
        headOfDepartment: headOfDepartment || null
      });
      return sendSuccess(res, 201, 'Department created successfully', { data: department });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/departments/:id
   */
  static async update(req, res, next) {
    try {
      const { name, code, description, headOfDepartment, isActive } = req.body;
      const department = await Department.findById(req.params.id);
      if (!department) {
        const error = new Error('Department not found');
        error.statusCode = 404;
        throw error;
      }
      if (name !== undefined) department.name = name.trim();
      if (code !== undefined) department.code = code.trim().toUpperCase();
      if (description !== undefined) department.description = description.trim();
      if (headOfDepartment !== undefined) department.headOfDepartment = headOfDepartment || null;
      if (isActive !== undefined) department.isActive = !!isActive;
      await department.save();
      return sendSuccess(res, 200, 'Department updated successfully', { data: department });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/departments/:id
   * Removes the managed record. Users/courses keep their department labels,
   * so the name may reappear as an unmanaged entry until relabeled.
   */
  static async remove(req, res, next) {
    try {
      const department = await Department.findByIdAndDelete(req.params.id);
      if (!department) {
        const error = new Error('Department not found');
        error.statusCode = 404;
        throw error;
      }
      return sendSuccess(res, 200, 'Department removed successfully', { data: { id: req.params.id } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DepartmentController;
