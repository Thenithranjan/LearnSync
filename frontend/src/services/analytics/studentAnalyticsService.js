import api from '../api';

const studentAnalyticsService = {
  /**
   * Get overall student analytics
   * @param {string} courseId - Optional course filter
   */
  async getOverview(courseId = null) {
    const params = courseId ? { courseId } : {};
    const response = await api.get('/analytics/student/overview', { params });
    return response.data.data;
  },

  /**
   * Get student performance across enrolled courses
   */
  async getCourses() {
    const response = await api.get('/analytics/student/courses');
    return response.data.data;
  },

  /**
   * Get student performance trends over assessments
   * @param {string} courseId - Optional course filter
   */
  async getTrends(courseId = null) {
    const params = courseId ? { courseId } : {};
    const response = await api.get('/analytics/student/trends', { params });
    return response.data.data;
  },

  /**
   * Get student topic-level accuracies
   * @param {string} courseId - Optional course filter
   */
  async getTopics(courseId = null) {
    const params = courseId ? { courseId } : {};
    const response = await api.get('/analytics/student/topics', { params });
    return response.data.data;
  }
};

export default studentAnalyticsService;
