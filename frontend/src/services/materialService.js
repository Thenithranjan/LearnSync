import api from './api';

export const getModuleMaterialsApi = async (moduleId) => {
  const response = await api.get(`/modules/${moduleId}/materials`);
  return response.data;
};

export const createMaterialApi = async (moduleId, materialData) => {
  const response = await api.post(`/modules/${moduleId}/materials`, materialData);
  return response.data;
};

export const updateMaterialApi = async (id, materialData) => {
  const response = await api.put(`/materials/${id}`, materialData);
  return response.data;
};

export const deleteMaterialApi = async (id) => {
  const response = await api.delete(`/materials/${id}`);
  return response.data;
};
