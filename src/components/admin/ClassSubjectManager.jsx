import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import classSubjectService from '../../services/classSubjectService';
import subjectService from '../../services/subjectService';

const ClassSubjectManager = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignedSubjectIds, setAssignedSubjectIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, subjectsData] = await Promise.all([
        classSubjectService.getAllClassesWithSubjects(),
        subjectService.getSubjects()
      ]);
      setClasses(classesData);
      setSubjects(subjectsData.filter(s => s.isActive));
      if (classesData.length > 0) {
        setSelectedClass(classesData[0]);
        setAssignedSubjectIds(classesData[0].Subjects?.map(s => s.id) || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (classId) => {
    const cls = classes.find(c => c.id === parseInt(classId));
    setSelectedClass(cls);
    setAssignedSubjectIds(cls?.Subjects?.map(s => s.id) || []);
  };

  const handleToggleSubject = (subjectId) => {
    setAssignedSubjectIds(prev =>
      prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]
    );
  };

  const handleSave = async () => {
    if (!selectedClass) return;
    try {
      await classSubjectService.assignSubjectsToClass(selectedClass.id, assignedSubjectIds);
      toast.success('រក្សាទុកបានជោគជ័យ');
      // Reload to reflect changes
      await loadData();
    } catch (error) {
      toast.error('មានបញ្ហា សូមព្យាយាមម្តងទៀត');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h3 className="mb-4">📚 កំណត់មុខវិជ្ជាតាមថ្នាក់</h3>
      <div className="row">
        <div className="col-md-4 mb-3">
          <label className="form-label">ជ្រើសរើសថ្នាក់</label>
          <select
            className="form-select"
            value={selectedClass?.id || ''}
            onChange={(e) => handleClassChange(e.target.value)}
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedClass && (
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">មុខវិជ្ជាសម្រាប់ថ្នាក់ {selectedClass.name}</h5>
          </div>
          <div className="card-body">
            <div className="row">
              {subjects.map(sub => (
                <div className="col-md-4 mb-2" key={sub.id}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`sub-${sub.id}`}
                      checked={assignedSubjectIds.includes(sub.id)}
                      onChange={() => handleToggleSubject(sub.id)}
                    />
                    <label className="form-check-label" htmlFor={`sub-${sub.id}`}>
                      {sub.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-3" onClick={handleSave}>
              រក្សាទុកការកំណត់
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassSubjectManager;