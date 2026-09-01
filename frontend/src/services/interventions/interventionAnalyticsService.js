import api from '../api';

const interventionAnalyticsService = {
  /**
   * Get faculty course intervention analytics
   */
  async getCourseAnalytics(courseId) {
    const response = await api.get(`/interventions/analytics/course/${courseId}`);
    return response.data.data;
  },

  /**
   * Get admin campus intervention analytics
   */
  async getAdminAnalytics() {
    const response = await api.get('/interventions/admin/analytics');
    return response.data.data;
  }
};

export default interventionAnalyticsService;
