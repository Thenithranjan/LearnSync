import api from './api';

export const toggleMaterialCompleteApi = async (materialId, completed = true) => {
  const response = await api.post(`/materials/${materialId}/complete`, { completed });
  return response.data;
};

export const getCourseProgressApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/progress`);
  return response.data;
};
