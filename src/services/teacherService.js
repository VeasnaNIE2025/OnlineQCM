//// frontend/src/services/teacherService.js
// import api from './api';

// const getMySubjects = async () => {
//   const response = await api.get('/teacher/subjects');
//   return response.data;
// };

// export default { getMySubjects };

import api from './api';

// ← យក .then(res => res.data) ចេញ — ឱ្យ Dashboard គ្រប់គ្រងខ្លួនឯង
const getMySubjects  = () => api.get('/teacher/subjects');
const getMyStats     = () => api.get('/teacher/stats');
const getMyQuestions = (params) => api.get('/teacher/questions', { params }).then(res => res.data);
const createMyQuestion = (data) => api.post('/teacher/questions', data).then(res => res.data);
const updateMyQuestion = (id, data) => api.put(`/teacher/questions/${id}`, data).then(res => res.data);
const deleteMyQuestion = (id) => api.delete(`/teacher/questions/${id}`).then(res => res.data);
const getMyReports   = () => api.get('/teacher/reports').then(res => res.data);

export default {
  getMySubjects,
  getMyStats,
  getMyQuestions,
  createMyQuestion,
  updateMyQuestion,
  deleteMyQuestion,
  getMyReports
};