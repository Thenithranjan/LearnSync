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
  const endpoint = `/api/${role.toLowerCase()}/test`;
  const response = await api.get(endpoint);
  return response.data;
};
