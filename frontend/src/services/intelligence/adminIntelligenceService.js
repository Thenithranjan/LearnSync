import api from '../api';

const adminIntelligenceService = {
  /**
   * Get campus-wide academic intelligence summary
   */
  async getOverview() {
    const response = await api.get('/intelligence/admin/overview');
    return response.data.data;
  }
};

export default adminIntelligenceService;
