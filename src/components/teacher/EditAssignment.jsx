import { useState, useEffect } from 'react';
import assignmentService from '../../services/assignmentService';
import api from '../../services/api';

const EditAssignment = ({ assignment, onUpdated }) => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({
    title:       assignment.title,
    description: assignment.description || '',
    subjectId:   assignment.subjectId,
    classId:     assignment.classId,
    dueDate:     assignment.dueDate?.slice(0, 16), // format datetime-local
    totalPoints: assignment.totalPoints
  });

  useEffect(() => {
    Promise.all([
      api.get('/teacher/subjects'),
      api.get('/teacher/classes')
    ]).then(([subRes, classRes]) => {
      setSubjects(subRes.data?.subjects || subRes.data || []);
      setClasses(classRes.data?.classes || classRes.data || []);
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assignmentService.updateAssignment(assignment.id, form);
      if (onUpdated) onUpdated();
    } catch (error) {
      alert(error.response?.data?.message || 'មានបញ្ហា!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h5 className="card-title mb-4">កែប្រែកិច្ចការ</h5>
        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label fw-medium">ចំណងជើងកិច្ចការ</label>
            <input type="text" name="title" value={form.title}
              onChange={handleChange} required className="form-control" />
          </div>

          <div className="mb-3">
            <label className="form-label fw-medium">ពិពណ៌នា</label>
            <textarea name="description" value={form.description}
              onChange={handleChange} rows={3} className="form-control" />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">មុខវិជ្ជា</label>
              <select name="subjectId" value={form.subjectId}
                onChange={handleChange} required className="form-select">
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">ថ្នាក់រៀន</label>
              <select name="classId" value={form.classId}
                onChange={handleChange} required className="form-select">
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-medium">ថ្ងៃផុតកំណត់</label>
              <input type="datetime-local" name="dueDate" value={form.dueDate}
                onChange={handleChange} required className="form-control" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">ពិន្ទុសរុប</label>
              <input type="number" name="totalPoints" value={form.totalPoints}
                onChange={handleChange} min={1} max={100} className="form-control" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-warning w-100">
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />កំពុងកែប្រែ...</>
              : '💾 រក្សាទុកការកែប្រែ'
            }
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditAssignment;