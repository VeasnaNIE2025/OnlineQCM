import api from './api';

// ════════════════════════════════════════════════
// TEACHER
// ════════════════════════════════════════════════

// បង្កើតកិច្ចការថ្មី
const createAssignment = (data) => 
  api.post('/teacher/assignments', data);

// ទាញកិច្ចការតាម Subject
// ថ្មី ← កែត្រង់នេះ
const getTeacherAssignments = () => 
  api.get('/teacher/assignments');

// មើល Submissions ទាំងអស់
const getSubmissions = (assignmentId) => 
  api.get(`/teacher/submissions/${assignmentId}`);

// ដាក់ពិន្ទុ + មតិកែលម្អ
const gradeSubmission = (submissionId, grade, feedback) =>
  api.put(`/teacher/submissions/${submissionId}/grade`, { grade, feedback });

// ════════════════════════════════════════════════
// STUDENT
// ════════════════════════════════════════════════

// មើលកិច្ចការទាំងអស់
const getStudentAssignments = () => 
  api.get('/student/assignments');

// ដាក់ស្នាដៃ (Upload File)
const submitAssignment = (assignmentId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/student/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// មើលពិន្ទុ + មតិ របស់ខ្លួន
const getMySubmissions = () => 
  api.get('/student/my-submissions');

export default {
  // Teacher
  createAssignment,
  getTeacherAssignments,
  getSubmissions,
  gradeSubmission,
  // Student
  getStudentAssignments,
  submitAssignment,
  getMySubmissions
};