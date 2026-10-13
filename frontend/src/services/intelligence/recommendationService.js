import api from '../api';

const recommendationService = {
  /**
   * Get personalized study recommendations.
   * Faculty/admin may pass studentId to review a specific student's list.
   */
  async getRecommendations(courseId = null, studentId = null) {
    const params = {};
    if (courseId) params.courseId = courseId;
    if (studentId) params.studentId = studentId;
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
