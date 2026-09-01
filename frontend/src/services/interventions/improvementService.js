import api from '../api';

const improvementService = {
  /**
   * Evaluate outcome improvement for intervention
   */
  async evaluateOutcome(interventionId) {
    const response = await api.post(`/interventions/${interventionId}/evaluate`);
    return response.data.data;
  },

  /**
   * Get student improvement history
   */
  async getStudentImprovementHistory() {
    const response = await api.get('/interventions/student/history');
    return response.data.data;
  }
};

export default improvementService;
