import api from '../api';

const studentIntelligenceService = {
  /**
   * Get student learning intelligence overview
   */
  async getOverview(courseId = null) {
    const params = courseId ? { courseId } : {};
    const response = await api.get('/intelligence/student/overview', { params });
    return response.data.data;
  },

  /**
   * Get student learning gaps
   */
  async getGaps(courseId = null) {
    const params = courseId ? { courseId } : {};
    const response = await api.get('/intelligence/student/gaps', { params });
    return response.data.data;
  },

  /**
   * Get student explainable academic risk indicator
   */
  async getRisk(courseId = null) {
    const params = courseId ? { courseId } : {};
    const response = await api.get('/intelligence/student/risk', { params });
    return response.data.data;
  }
};

export default studentIntelligenceService;
