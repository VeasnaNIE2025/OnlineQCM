// import { useState, useEffect } from 'react';
// import assignmentService from '../../services/assignmentService';
// import api from '../../services/api';

// const CreateAssignment = ({ onCreated }) => {
//   const [subjects, setSubjects] = useState([]);
//   const [classes, setClasses]   = useState([]);   // ← បន្ថែម
//   const [loading, setLoading]   = useState(false);
//   const [form, setForm]         = useState({
//     title: '', description: '', subjectId: '', classId: '', dueDate: '', totalPoints: 100
//   });

//   useEffect(() => {
//     api.get('/teacher/subjects').then(res => {
//       setSubjects(res.data?.subjects || res.data || []);
//     });
//   }, []);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await assignmentService.createAssignment(form);
//       alert('បង្កើតកិច្ចការដោយជោគជ័យ!');
//       setForm({ title: '', description: '', subjectId: '', dueDate: '', totalPoints: 100 });
//       if (onCreated) onCreated();
//     } catch (error) {
//       alert(error.response?.data?.message || 'មានបញ្ហា!');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="card shadow-sm">
//       <div className="card-body p-4">
//         <h5 className="card-title mb-4">បង្កើតកិច្ចការថ្មី</h5>
//         <form onSubmit={handleSubmit}>

//           {/* Title */}
//           <div className="mb-3">
//             <label className="form-label fw-medium">ចំណងជើងកិច្ចការ</label>
//             <input type="text" name="title" value={form.title}
//               onChange={handleChange} required
//               className="form-control"
//               placeholder="ឧ. កិច្ចការអំពីវិចនានុក្រម" />
//           </div>

//           {/* Description */}
//           <div className="mb-3">
//             <label className="form-label fw-medium">ពិពណ៌នា</label>
//             <textarea name="description" value={form.description}
//               onChange={handleChange} rows={3}
//               className="form-control"
//               placeholder="សរសេរការណែនាំ..." />
//           </div>

//           {/* Subject + DueDate */}
//           <div className="row mb-3">
//             <div className="col-md-6">
//               <label className="form-label fw-medium">មុខវិជ្ជា</label>
//               <select name="subjectId" value={form.subjectId}
//                 onChange={handleChange} required className="form-select">
//                 <option value="">ជ្រើសរើស...</option>
//                 {subjects.map(s => (
//                   <option key={s.id} value={s.id}>{s.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="col-md-6">
//               <label className="form-label fw-medium">ថ្ងៃផុតកំណត់</label>
//               <input type="datetime-local" name="dueDate" value={form.dueDate}
//                 onChange={handleChange} required className="form-control" />
//             </div>
//           </div>

//           {/* Total Points */}
//           <div className="mb-4">
//             <label className="form-label fw-medium">ពិន្ទុសរុប</label>
//             <input type="number" name="totalPoints" value={form.totalPoints}
//               onChange={handleChange} min={1} max={100} className="form-control" />
//           </div>

//           <button type="submit" disabled={loading} className="btn btn-primary w-100">
//             {loading ? (
//               <><span className="spinner-border spinner-border-sm me-2" />កំពុងបង្កើត...</>
//             ) : 'បង្កើតកិច្ចការ'}
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateAssignment;


import { useState, useEffect } from 'react';
import assignmentService from '../../services/assignmentService';
import api from '../../services/api';

const CreateAssignment = ({ onCreated }) => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses]   = useState([]);   // ← បន្ថែម
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({
    title: '', description: '', subjectId: '',
    classId: '',                                   // ← បន្ថែម
    dueDate: '', totalPoints: 100
  });

  useEffect(() => {
    // ទាញ subjects + classes ក្នុងពេលតែមួយ
    Promise.all([
      api.get('/teacher/subjects'),
      api.get('/teacher/classes')                  // ← endpoint ថ្មី
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
      await assignmentService.createAssignment(form);
      alert('បង្កើតកិច្ចការដោយជោគជ័យ!');
      setForm({ title: '', description: '', subjectId: '', classId: '', dueDate: '', totalPoints: 100 });
      if (onCreated) onCreated();
    } catch (error) {
      alert(error.response?.data?.message || 'មានបញ្ហា!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body p-4">
        <h5 className="card-title mb-4">បង្កើតកិច្ចការថ្មី</h5>
        <form onSubmit={handleSubmit}>

          {/* Title */}
          <div className="mb-3">
            <label className="form-label fw-medium">ចំណងជើងកិច្ចការ</label>
            <input type="text" name="title" value={form.title}
              onChange={handleChange} required className="form-control"
              placeholder="ឧ. កិច្ចការអំពីវិចនានុក្រម" />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="form-label fw-medium">ពិពណ៌នា</label>
            <textarea name="description" value={form.description}
              onChange={handleChange} rows={3} className="form-control"
              placeholder="សរសេរការណែនាំ..." />
          </div>

          {/* Subject + Class */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-medium">មុខវិជ្ជា</label>
              <select name="subjectId" value={form.subjectId}
                onChange={handleChange} required className="form-select">
                <option value="">ជ្រើសរើស...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-medium">ថ្នាក់រៀន</label>   {/* ← ថ្មី */}
              <select name="classId" value={form.classId}
                onChange={handleChange} required className="form-select">
                <option value="">ជ្រើសរើស...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DueDate + Points */}
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

          <button type="submit" disabled={loading} className="btn btn-primary w-100">
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />កំពុងបង្កើត...</>
              : 'បង្កើតកិច្ចការ'
            }
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateAssignment;