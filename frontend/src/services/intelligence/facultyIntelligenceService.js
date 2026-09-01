import api from '../api';

const facultyIntelligenceService = {
  /**
   * Get faculty course early warnings and at-risk students
   */
  async getCourseEarlyWarning(courseId) {
    const response = await api.get(`/intelligence/course/${courseId}/early-warning`);
    return response.data.data;
  },

  /**
   * Get class attention topics
   */
  async getCourseTopics(courseId) {
    const response = await api.get(`/intelligence/course/${courseId}/topics`);
    return response.data.data;
  },

  /**
   * Get student detailed risk breakdown for course
   */
  async getStudentRiskDetail(courseId, studentId) {
    const response = await api.get(`/intelligence/course/${courseId}/students/${studentId}`);
    return response.data.data;
  }
};

export default facultyIntelligenceService;
