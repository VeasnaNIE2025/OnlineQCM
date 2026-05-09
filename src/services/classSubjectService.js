import api from './api';

const getAllClassesWithSubjects = async () => {
  const response = await api.get('/admin/classes-subjects');
  return response.data;
};

const getSubjectsByClass = async (classId) => {
  const response = await api.get(`/admin/classes/${classId}/subjects`);
  return response.data;
};

const assignSubjectsToClass = async (classId, subjectIds) => {
  const response = await api.put(`/admin/classes/${classId}/subjects`, { subjectIds });
  return response.data;
};

export default { getAllClassesWithSubjects, getSubjectsByClass, assignSubjectsToClass };