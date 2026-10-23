import api from './api';

export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data?.data?.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data?.data?.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

export const logoutApi = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } finally {
    localStorage.removeItem('token');
  }
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const changePasswordApi = async (currentPassword, newPassword) => {
  const response = await api.put('/auth/change-password', { currentPassword, newPassword });
  return response.data;
};
