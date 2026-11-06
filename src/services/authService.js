import api from './api';

const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const getRegistrationStatus = async () => {
  const response = await api.get('/auth/registration-status');
  return response.data;
};

const getAdminRegistrationSetting = async () => {
  const response = await api.get('/admin/settings/registration');
  return response.data;
};

const updateAdminRegistrationSetting = async (allowRegistration) => {
  const response = await api.put('/admin/settings/registration', { allowRegistration });
  return response.data;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  getRegistrationStatus,
  getAdminRegistrationSetting,
  updateAdminRegistrationSetting,
};
