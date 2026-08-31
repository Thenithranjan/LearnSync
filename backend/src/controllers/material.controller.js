const MaterialService = require('../services/material.service');
const { sendSuccess } = require('../utils/apiResponse');

class MaterialController {
  /**
   * POST /api/modules/:moduleId/materials
   */
  static async create(req, res, next) {
    try {
      const materialDoc = await MaterialService.createMaterial(req.params.moduleId, req.body, req.user);
      return sendSuccess(res, 201, 'Material created successfully', { material: materialDoc });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/modules/:moduleId/materials
   */
  static async getByModule(req, res, next) {
    try {
      const materials = await MaterialService.getModuleMaterials(req.params.moduleId, req.user);
      return sendSuccess(res, 200, 'Materials retrieved successfully', { materials });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/materials/:id
   */
  static async getById(req, res, next) {
    try {
      const materialDoc = await MaterialService.getMaterialById(req.params.id, req.user);
      return sendSuccess(res, 200, 'Material retrieved successfully', { material: materialDoc });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/materials/:id
   */
  static async update(req, res, next) {
    try {
      const materialDoc = await MaterialService.updateMaterial(req.params.id, req.body, req.user);
      return sendSuccess(res, 200, 'Material updated successfully', { material: materialDoc });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/materials/:id
   */
  static async delete(req, res, next) {
    try {
      await MaterialService.deleteMaterial(req.params.id, req.user);
      return sendSuccess(res, 200, 'Material deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MaterialController;
