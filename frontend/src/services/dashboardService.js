import api from './api';

const dashboardService = {
  async getStudentDashboard() {
    const response = await api.get('/dashboard/student');
    return response.data.data;
  },

  async getFacultyDashboard() {
    const response = await api.get('/dashboard/faculty');
    return response.data.data;
  },

  async getAdminDashboard() {
    const response = await api.get('/dashboard/admin');
    return response.data.data;
  }
};

export default dashboardService;
