const Material = require('../models/Material');
const Module = require('../models/Module');
const Course = require('../models/Course');

class MaterialService {
  /**
   * Create material inside a module
   */
  static async createMaterial(moduleId, materialData, user) {
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      const error = new Error('Module not found.');
      error.statusCode = 404;
      throw error;
    }

    const course = await Course.findById(moduleDoc.courseId);
    if (!course) {
      const error = new Error('Parent course not found.');
      error.statusCode = 404;
      throw error;
    }

    // Permission check
    if (user.role !== 'ADMIN' && String(course.faculty) !== String(user._id)) {
      const error = new Error('You are not authorized to add materials to this module.');
      error.statusCode = 403;
      throw error;
    }

    const { title, description, type, url, duration, order, isPublished } = materialData;

    if (!title || !type || !url) {
      const error = new Error('Title, type (PDF/VIDEO/LINK/DOCUMENT), and URL are required.');
      error.statusCode = 400;
      throw error;
    }

    let materialOrder = order;
    if (materialOrder === undefined) {
      const count = await Material.countDocuments({ moduleId });
      materialOrder = count + 1;
    }

    const materialDoc = await Material.create({
      moduleId,
      title: title.trim(),
      description: description ? description.trim() : '',
      type,
      url: url.trim(),
      duration: duration || 0,
      order: materialOrder,
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: user._id
    });

    return materialDoc;
  }

  /**
   * Get all materials for a module
   */
  static async getModuleMaterials(moduleId, user) {
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      const error = new Error('Module not found.');
      error.statusCode = 404;
      throw error;
    }

    const filter = { moduleId };
    if (user.role === 'STUDENT') {
      filter.isPublished = true;
    }

    return await Material.find(filter).sort({ order: 1, createdAt: 1 });
  }

  /**
   * Get single material by ID
   */
  static async getMaterialById(materialId, user) {
    const materialDoc = await Material.findById(materialId).populate({
      path: 'moduleId',
      select: 'title courseId isPublished',
      populate: { path: 'courseId', select: 'title code faculty status' }
    });

    if (!materialDoc) {
      const error = new Error('Material not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'STUDENT' && !materialDoc.isPublished) {
      const error = new Error('Material is not published.');
      error.statusCode = 403;
      throw error;
    }

    return materialDoc;
  }

  /**
   * Update material
   */
  static async updateMaterial(materialId, updateData, user) {
    const materialDoc = await Material.findById(materialId);
    if (!materialDoc) {
      const error = new Error('Material not found.');
      error.statusCode = 404;
      throw error;
    }

    const moduleDoc = await Module.findById(materialDoc.moduleId);
    const course = await Course.findById(moduleDoc.courseId);

    if (user.role !== 'ADMIN' && String(course.faculty) !== String(user._id)) {
      const error = new Error('You are not authorized to update this material.');
      error.statusCode = 403;
      throw error;
    }

    if (updateData.title) materialDoc.title = updateData.title.trim();
    if (updateData.description !== undefined) materialDoc.description = updateData.description.trim();
    if (updateData.type) materialDoc.type = updateData.type;
    if (updateData.url) materialDoc.url = updateData.url.trim();
    if (updateData.duration !== undefined) materialDoc.duration = Number(updateData.duration);
    if (updateData.order !== undefined) materialDoc.order = Number(updateData.order);
    if (updateData.isPublished !== undefined) materialDoc.isPublished = Boolean(updateData.isPublished);

    await materialDoc.save();
    return materialDoc;
  }

  /**
   * Delete material
   */
  static async deleteMaterial(materialId, user) {
    const materialDoc = await Material.findById(materialId);
    if (!materialDoc) {
      const error = new Error('Material not found.');
      error.statusCode = 404;
      throw error;
    }

    const moduleDoc = await Module.findById(materialDoc.moduleId);
    const course = await Course.findById(moduleDoc.courseId);

    if (user.role !== 'ADMIN' && String(course.faculty) !== String(user._id)) {
      const error = new Error('You are not authorized to delete this material.');
      error.statusCode = 403;
      throw error;
    }

    await Material.findByIdAndDelete(materialId);
    return true;
  }
}

module.exports = MaterialService;
