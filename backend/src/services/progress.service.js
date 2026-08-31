const LearningProgress = require('../models/LearningProgress');
const Material = require('../models/Material');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

class ProgressService {
  /**
   * Mark or toggle material completion for student
   */
  static async toggleMaterialComplete(materialId, user, completedState = true) {
    const materialDoc = await Material.findById(materialId);
    if (!materialDoc) {
      const error = new Error('Material not found.');
      error.statusCode = 404;
      throw error;
    }

    const moduleDoc = await Module.findById(materialDoc.moduleId);
    if (!moduleDoc) {
      const error = new Error('Module not found.');
      error.statusCode = 404;
      throw error;
    }

    const courseId = moduleDoc.courseId;

    // Check enrollment if student
    if (user.role === 'STUDENT') {
      const isEnrolled = await Enrollment.findOne({ studentId: user._id, courseId, status: 'ACTIVE' });
      if (!isEnrolled) {
        const error = new Error('You must be enrolled in this course to track progress.');
        error.statusCode = 403;
        throw error;
      }
    }

    let progressDoc = await LearningProgress.findOne({ studentId: user._id, materialId });

    if (!progressDoc) {
      progressDoc = await LearningProgress.create({
        studentId: user._id,
        courseId,
        materialId,
        completed: completedState,
        completedAt: new Date()
      });
    } else {
      progressDoc.completed = completedState;
      progressDoc.completedAt = completedState ? new Date() : progressDoc.completedAt;
      await progressDoc.save();
    }

    // Calculate current overall course progress %
    const overallProgress = await this.getCourseProgress(courseId, user);

    return {
      completedMaterialId: materialId,
      completed: progressDoc.completed,
      courseProgressPercentage: overallProgress.progressPercentage,
      completedCount: overallProgress.completedCount,
      totalMaterialsCount: overallProgress.totalMaterialsCount
    };
  }

  /**
   * Calculate student course progress percentage
   */
  static async getCourseProgress(courseId, user) {
    // Find all published modules for this course
    const modules = await Module.find({ courseId, isPublished: true }).select('_id');
    const moduleIds = modules.map((m) => m._id);

    // Find all published materials in these modules
    const publishedMaterials = await Material.find({
      moduleId: { $in: moduleIds },
      isPublished: true
    }).select('_id');

    const totalMaterialsCount = publishedMaterials.length;
    const materialIds = publishedMaterials.map((m) => m._id);

    // Find completed progress entries for this student
    const completedEntries = await LearningProgress.find({
      studentId: user._id,
      materialId: { $in: materialIds },
      completed: true
    }).select('materialId');

    const completedCount = completedEntries.length;
    const progressPercentage = totalMaterialsCount > 0
      ? Math.round((completedCount / totalMaterialsCount) * 100)
      : 0;

    return {
      courseId,
      progressPercentage,
      completedCount,
      totalMaterialsCount,
      completedMaterialIds: completedEntries.map((e) => e.materialId)
    };
  }
}

module.exports = ProgressService;
