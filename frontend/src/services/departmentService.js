import api from './api';

const departmentService = {
  async getDepartments() {
    const response = await api.get('/departments');
    return response.data.data;
  },

  async createDepartment(data) {
    const response = await api.post('/departments', data);
    return response.data.data;
  },

  async updateDepartment(id, data) {
    const response = await api.put(`/departments/${id}`, data);
    return response.data.data;
  },

  async deleteDepartment(id) {
    const response = await api.delete(`/departments/${id}`);
    return response.data.data;
  }
};

export default departmentService;
