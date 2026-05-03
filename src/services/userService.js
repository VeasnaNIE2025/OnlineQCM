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

export default { getUsers, getUserById, createUser, updateUser, deleteUser };