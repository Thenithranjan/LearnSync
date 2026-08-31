const Module = require('../models/Module');
const Course = require('../models/Course');

class ModuleService {
  /**
   * Create a new module inside a course
   */
  static async createModule(courseId, moduleData, user) {
    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    // Check permission
    if (user.role !== 'ADMIN' && String(course.faculty) !== String(user._id)) {
      const error = new Error('You are not authorized to add modules to this course.');
      error.statusCode = 403;
      throw error;
    }

    const { title, description, order, isPublished } = moduleData;
    if (!title) {
      const error = new Error('Module title is required.');
      error.statusCode = 400;
      throw error;
    }

    // Determine default order if not provided
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const count = await Module.countDocuments({ courseId });
      moduleOrder = count + 1;
    }

    const moduleDoc = await Module.create({
      courseId,
      title: title.trim(),
      description: description ? description.trim() : '',
      order: moduleOrder,
      isPublished: isPublished !== undefined ? isPublished : true
    });

    return moduleDoc;
  }

  /**
   * Get all modules for a course
   */
  static async getCourseModules(courseId, user) {
    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    const filter = { courseId };

    // Students only see published modules
    if (user.role === 'STUDENT') {
      filter.isPublished = true;
    }

    return await Module.find(filter).sort({ order: 1, createdAt: 1 });
  }

  /**
   * Get single module by ID
   */
  static async getModuleById(moduleId, user) {
    const moduleDoc = await Module.findById(moduleId).populate('courseId', 'title code faculty status');
    if (!moduleDoc) {
      const error = new Error('Module not found.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'STUDENT' && !moduleDoc.isPublished) {
      const error = new Error('Module is not published.');
      error.statusCode = 403;
      throw error;
    }

    return moduleDoc;
  }

  /**
   * Update module
   */
  static async updateModule(moduleId, updateData, user) {
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      const error = new Error('Module not found.');
      error.statusCode = 404;
      throw error;
    }

    const course = await Course.findById(moduleDoc.courseId);
    if (user.role !== 'ADMIN' && String(course.faculty) !== String(user._id)) {
      const error = new Error('You are not authorized to update this module.');
      error.statusCode = 403;
      throw error;
    }

    if (updateData.title) moduleDoc.title = updateData.title.trim();
    if (updateData.description !== undefined) moduleDoc.description = updateData.description.trim();
    if (updateData.order !== undefined) moduleDoc.order = Number(updateData.order);
    if (updateData.isPublished !== undefined) moduleDoc.isPublished = Boolean(updateData.isPublished);

    await moduleDoc.save();
    return moduleDoc;
  }

  /**
   * Delete module
   */
  static async deleteModule(moduleId, user) {
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      const error = new Error('Module not found.');
      error.statusCode = 404;
      throw error;
    }

    const course = await Course.findById(moduleDoc.courseId);
    if (user.role !== 'ADMIN' && String(course.faculty) !== String(user._id)) {
      const error = new Error('You are not authorized to delete this module.');
      error.statusCode = 403;
      throw error;
    }

    await Module.findByIdAndDelete(moduleId);
    return true;
  }
}

module.exports = ModuleService;
