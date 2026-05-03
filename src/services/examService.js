import api from './api';

const getExams = async () => {
  const response = await api.get('/admin/exams');
  return response.data;
};

const getExamById = async (id) => {
  const response = await api.get(`/admin/exams/${id}`);
  return response.data;
};

const createExam = async (data) => {
  const response = await api.post('/admin/exams', data);
  return response.data;
};

const updateExam = async (id, data) => {
  const response = await api.put(`/admin/exams/${id}`, data);
  return response.data;
};

const deleteExam = async (id) => {
  const response = await api.delete(`/admin/exams/${id}`);
  return response.data;
};

export default { getExams, getExamById, createExam, updateExam, deleteExam };