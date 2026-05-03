import api from './api';

const getQuestions = async (params = {}) => {
  const response = await api.get('/admin/questions', { params });
  return response.data;
};

const getQuestionById = async (id) => {
  const response = await api.get(`/admin/questions/${id}`);
  return response.data;
};

const createQuestion = async (data) => {
  const response = await api.post('/admin/questions', data);
  return response.data;
};

const updateQuestion = async (id, data) => {
  const response = await api.put(`/admin/questions/${id}`, data);
  return response.data;
};

const deleteQuestion = async (id) => {
  const response = await api.delete(`/admin/questions/${id}`);
  return response.data;
};

export default { getQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion };