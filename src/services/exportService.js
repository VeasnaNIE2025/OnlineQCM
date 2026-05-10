// import api from './api';

// const exportExamResults = async (examId = null) => {
//   const params = examId ? { examId } : {};
//   const response = await api.get('/admin/export/exam-results', {
//     params,
//     responseType: 'blob'
//   });
//   return response.data;
// };

// const exportStudentPerformance = async () => {
//   const response = await api.get('/admin/export/student-performance', {
//     responseType: 'blob'
//   });
//   return response.data;
// };

// const exportSubjectPerformance = async () => {
//   const response = await api.get('/admin/export/subject-performance', {
//     responseType: 'blob'
//   });
//   return response.data;
// };

// const downloadFile = (data, filename) => {
//   const url = window.URL.createObjectURL(new Blob([data]));
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute('download', filename);
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
//   window.URL.revokeObjectURL(url);
// };

// export default {
//   exportExamResults,
//   exportStudentPerformance,
//   exportSubjectPerformance,
//   downloadFile
// };

import api from './api';

// ── Excel exports ─────────────────────────────────────────────
const exportExamResults = async (examId = null) => {
  const params = examId ? { examId } : {};
  const response = await api.get('/admin/export/exam-results', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

const exportStudentPerformance = async () => {
  const response = await api.get('/admin/export/student-performance', {
    responseType: 'blob'
  });
  return response.data;
};

const exportSubjectPerformance = async () => {
  const response = await api.get('/admin/export/subject-performance', {
    responseType: 'blob'
  });
  return response.data;
};

// ── PDF export ────────────────────────────────────────────────
const downloadExamResultPDF = async (resultId) => {
  const response = await api.get(`/admin/export/result/${resultId}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

// ── Download helper ───────────────────────────────────────────
const downloadFile = (data, filename) => {
  const url  = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default {
  exportExamResults,
  exportStudentPerformance,
  exportSubjectPerformance,
  downloadExamResultPDF,
  downloadFile
};