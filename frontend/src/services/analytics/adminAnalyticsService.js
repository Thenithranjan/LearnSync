import api from '../api';

const adminAnalyticsService = {
  /**
   * Get institution-wide analytics overview
   */
  async getOverview() {
    const response = await api.get('/analytics/admin/overview');
    return response.data.data;
  },

  /**
   * Get department-level academic breakdowns
   */
  async getDepartments() {
    const response = await api.get('/analytics/admin/departments');
    return response.data.data;
  }
};

export default adminAnalyticsService;
