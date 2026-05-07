import api from './api';

// ========== Student endpoints ==========
const getAvailableExams = async () => {
  const response = await api.get('/student/exams');  // ✅ path ត្រូវតែមាន '/student'
  return response.data;
};

const getExamDetails = async (id) => {
  const response = await api.get(`/student/exams/${id}`);
  return response.data;
};

const submitExam = async (id, answers) => {
  const response = await api.post(`/student/exams/${id}/submit`, { answers });
  return response.data;
};

const getMyResults = async () => {
  const response = await api.get('/student/results');
  return response.data;
};

// ========== Admin endpoints ==========
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

export default {
  // Student
  getAvailableExams,
  getExamDetails,
  submitExam,
  getMyResults,
  // Admin
  getExams,        // ✅ បន្ថែមនេះ
  getExamById,
  createExam,
  updateExam,
  deleteExam
};