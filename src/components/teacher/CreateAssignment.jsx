import { useState, useEffect } from 'react';
import assignmentService from '../../services/assignmentService';
import api from '../../services/api';          // ← import api ថ្មី

const CreateAssignment = ({ onCreated }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({
    title:       '',
    description: '',
    subjectId:   '',
    dueDate:     '',
    totalPoints: 100
  });

  useEffect(() => {
    api.get('/teacher/subjects').then(res => {
      setSubjects(res.data?.subjects || res.data || []);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assignmentService.createAssignment(form);
      alert('បង្កើតកិច្ចការដោយជោគជ័យ!');
      setForm({ title: '', description: '', subjectId: '', dueDate: '', totalPoints: 100 });
      if (onCreated) onCreated();
    } catch (error) {
      alert(error.response?.data?.message || 'មានបញ្ហា!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">បង្កើតកិច្ចការថ្មី</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ចំណងជើងកិច្ចការ</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ឧ. កិច្ចការអំពីវិចនានុក្រម" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ពិពណ៌នា</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="សរសេរការណែនាំ..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">មុខវិជ្ជា</label>
            <select name="subjectId" value={form.subjectId} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">ជ្រើសរើស...</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ថ្ងៃផុតកំណត់</label>
            <input type="datetime-local" name="dueDate" value={form.dueDate} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ពិន្ទុសរុប</label>
          <input type="number" name="totalPoints" value={form.totalPoints} onChange={handleChange}
            min={1} max={100}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {loading ? 'កំពុងបង្កើត...' : 'បង្កើតកិច្ចការ'}
        </button>
      </form>
    </div>
  );
};

export default CreateAssignment;