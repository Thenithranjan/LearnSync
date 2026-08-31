import api from './api';

export const getCourseModulesApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/modules`);
  return response.data;
};

export const createModuleApi = async (courseId, moduleData) => {
  const response = await api.post(`/courses/${courseId}/modules`, moduleData);
  return response.data;
};

export const updateModuleApi = async (id, moduleData) => {
  const response = await api.put(`/modules/${id}`, moduleData);
  return response.data;
};

export const deleteModuleApi = async (id) => {
  const response = await api.delete(`/modules/${id}`);
  return response.data;
};
