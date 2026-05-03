import api from './api';

const getStatistics = async () => {
  const response = await api.get('/admin/reports/statistics');
  return response.data;
};

const getExamResultsReport = async (examId = null) => {
  const params = examId ? { examId } : {};
  const response = await api.get('/admin/reports/exam-results', { params });
  return response.data;
};

const getStudentPerformance = async () => {
  const response = await api.get('/admin/reports/student-performance');
  return response.data;
};

const getSubjectPerformance = async () => {
  const response = await api.get('/admin/reports/subject-performance');
  return response.data;
};

const getExamAnalytics = async () => {
  const response = await api.get('/admin/reports/exam-analytics');
  return response.data;
};

const getTopStudents = async (limit = 10) => {
  const response = await api.get('/admin/reports/top-students', { params: { limit } });
  return response.data;
};

const getRecentActivities = async () => {
  const response = await api.get('/admin/reports/recent-activities');
  return response.data;
};

export default {
  getStatistics,
  getExamResultsReport,
  getStudentPerformance,
  getSubjectPerformance,
  getExamAnalytics,
  getTopStudents,
  getRecentActivities
};