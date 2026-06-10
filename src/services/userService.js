import api from './api';

const getUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

const updateUser = async (id, userData) => {
  const response = await api.put(`/admin/users/${id}`, userData);
  return response.data;
};

const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

const downloadTemplate = async () => {
  const response = await api.get('/admin/users/template', {
    responseType: 'blob'
  });
  return response.data;
};

const importUsers = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/admin/users/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export default { getUsers, getUserById, createUser, updateUser, deleteUser , downloadTemplate, importUsers};