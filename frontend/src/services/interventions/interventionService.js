import api from '../api';

const interventionService = {
  /**
   * Create a manual intervention (Faculty / Admin)
   */
  async createIntervention(data) {
    const response = await api.post('/interventions', data);
    return response.data.data;
  },

  /**
   * Convert Module 7 recommendation into intervention
   */
  async createFromRecommendation(recommendationId, data = {}) {
    const response = await api.post(`/interventions/from-recommendation/${recommendationId}`, data);
    return response.data.data;
  },

  /**
   * List interventions with optional filters and pagination
   */
  async getInterventions(params = {}) {
    const response = await api.get('/interventions', { params });
    return response.data;
  },

  /**
   * Get single intervention details
   */
  async getInterventionById(id) {
    const response = await api.get(`/interventions/${id}`);
    return response.data.data;
  },

  /**
   * Student acknowledges intervention
   */
  async acknowledgeIntervention(id) {
    const response = await api.post(`/interventions/${id}/acknowledge`);
    return response.data.data;
  },

  /**
   * Student starts intervention
   */
  async startIntervention(id) {
    const response = await api.post(`/interventions/${id}/start`);
    return response.data.data;
  },

  /**
   * Student completes intervention action
   */
  async completeIntervention(id, studentResponse = '') {
    const response = await api.post(`/interventions/${id}/complete`, { studentResponse });
    return response.data.data;
  },

  /**
   * Faculty reviews intervention and submits outcome
   */
  async reviewIntervention(id, data) {
    const response = await api.post(`/interventions/${id}/review`, data);
    return response.data.data;
  }
};

export default interventionService;
