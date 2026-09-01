import api from '../api';

const recommendationService = {
  /**
   * Get personalized study recommendations
   */
  async getRecommendations(courseId = null) {
    const params = courseId ? { courseId } : {};
    const response = await api.get('/intelligence/student/recommendations', { params });
    return response.data.data;
  },

  /**
   * Mark recommendation as completed
   */
  async completeRecommendation(id) {
    const response = await api.post(`/intelligence/recommendations/${id}/complete`);
    return response.data.data;
  },

  /**
   * Dismiss recommendation
   */
  async dismissRecommendation(id) {
    const response = await api.post(`/intelligence/recommendations/${id}/dismiss`);
    return response.data.data;
  }
};

export default recommendationService;
