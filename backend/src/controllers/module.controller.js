const ModuleService = require('../services/module.service');
const { sendSuccess } = require('../utils/apiResponse');

class ModuleController {
  /**
   * POST /api/courses/:courseId/modules
   */
  static async create(req, res, next) {
    try {
      const moduleDoc = await ModuleService.createModule(req.params.courseId, req.body, req.user);
      return sendSuccess(res, 201, 'Module created successfully', { module: moduleDoc });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courses/:courseId/modules
   */
  static async getByCourse(req, res, next) {
    try {
      const modules = await ModuleService.getCourseModules(req.params.courseId, req.user);
      return sendSuccess(res, 200, 'Modules retrieved successfully', { modules });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/modules/:id
   */
  static async getById(req, res, next) {
    try {
      const moduleDoc = await ModuleService.getModuleById(req.params.id, req.user);
      return sendSuccess(res, 200, 'Module retrieved successfully', { module: moduleDoc });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/modules/:id
   */
  static async update(req, res, next) {
    try {
      const moduleDoc = await ModuleService.updateModule(req.params.id, req.body, req.user);
      return sendSuccess(res, 200, 'Module updated successfully', { module: moduleDoc });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/modules/:id
   */
  static async delete(req, res, next) {
    try {
      await ModuleService.deleteModule(req.params.id, req.user);
      return sendSuccess(res, 200, 'Module deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ModuleController;
