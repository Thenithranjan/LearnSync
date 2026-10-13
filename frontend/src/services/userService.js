import api from './api';

export const getProfileApi = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const testRoleApi = async (role) => {
  const endpoint = `/${role.toLowerCase()}/test`;
  const response = await api.get(endpoint);
  return response.data;
};

export const listUsersApi = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const updateUserApi = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUserApi = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
