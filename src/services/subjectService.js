import api from './api';

const getSubjects = async (params = {}) => {
  const response = await api.get('/admin/subjects', { params });
  return response.data;
};

const getSubjectById = async (id) => {
  const response = await api.get(`/admin/subjects/${id}`);
  return response.data;
};

const createSubject = async (data) => {
  const response = await api.post('/admin/subjects', data);
  return response.data;
};

const updateSubject = async (id, data) => {
  const response = await api.put(`/admin/subjects/${id}`, data);
  return response.data;
};

const deleteSubject = async (id) => {
  const response = await api.delete(`/admin/subjects/${id}`);
  return response.data;
};

export default { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject };