import api from '../api';

const facultyAnalyticsService = {
  /**
   * Get faculty overview across assigned courses
   */
  async getOverview() {
    const response = await api.get('/analytics/faculty/overview');
    return response.data.data;
  },

  /**
   * Get course assessment performance trends
   */
  async getCourseTrends(courseId) {
    const response = await api.get(`/analytics/course/${courseId}/trends`);
    return response.data.data;
  },

  /**
   * Get course grade distribution histogram data
   */
  async getCourseDistribution(courseId) {
    const response = await api.get(`/analytics/course/${courseId}/distribution`);
    return response.data.data;
  },

  /**
   * Get course topic-wise performance
   */
  async getCourseTopics(courseId) {
    const response = await api.get(`/analytics/course/${courseId}/topics`);
    return response.data.data;
  },

  /**
   * Get course student roster with granular performance breakdowns
   */
  async getCourseStudents(courseId, options = {}) {
    const response = await api.get(`/analytics/course/${courseId}/students`, { params: options });
    return response.data.data;
  }
};

export default facultyAnalyticsService;
