import api from './api';

// Get available exams for student
const getAvailableExams = async () => {
  const response = await api.get('/student/exams');
  return response.data;
};

// Get exam details with questions
const getExamDetails = async (examId) => {
  const response = await api.get(`/student/exams/${examId}`);
  return response.data;
};

// Submit exam answers
const submitExam = async (examId, answers) => {
  const response = await api.post(`/student/exams/${examId}/submit`, { answers });
  return response.data;
};

// Get student results history
const getMyResults = async () => {
  const response = await api.get('/student/results');
  return response.data;
};

// Get specific result
const getResultById = async (resultId) => {
  const response = await api.get(`/student/results/${resultId}`);
  return response.data;
};

export default { getAvailableExams, getExamDetails, submitExam, getMyResults, getResultById };