import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBook, FaRandom } from 'react-icons/fa';
import toast from 'react-hot-toast';
import examService from '../../services/examService';
import subjectService from '../../services/subjectService';
import questionService from '../../services/questionService';


// ✅ UTC from DB → Cambodia local time for datetime-local input
const toLocalInput = (utcStr) => {
  if (!utcStr) return '';
  const d = new Date(utcStr); // JS treats as UTC if has Z, or as-is
  const cambodia = new Date(d.getTime() + 7 * 60 * 60 * 1000); // +7h
  return cambodia.toISOString().slice(0, 16); // "2026-05-03T20:57"
};

// ✅ Cambodia local time from input → UTC string for backend
const toUTCString = (localStr) => {
  if (!localStr) return '';
  // localStr = "2026-05-03T20:57" (Cambodia time)
  // Append +07:00 so JS knows it's Cambodia time → convert to UTC
  const d = new Date(localStr + ':00+07:00');
  return d.toISOString().slice(0, 19).replace('T', ' '); // "2026-05-03 13:57:00"
};

// ✅ Display UTC date as Cambodia local time
const formatDate = (utcStr) => {
  if (!utcStr) return '';
  return new Date(utcStr).toLocaleString('km-KH', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
};

const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [randomMode, setRandomMode] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    description: '',
    duration: 60,
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsData, subjectsData, questionsData] = await Promise.all([
        examService.getExams(),
        subjectService.getSubjects(),
        questionService.getQuestions()
      ]);
      setExams(examsData);
      setSubjects(subjectsData.filter(s => s.isActive));
      setQuestions(questionsData);
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        title: exam.title,
        subjectId: exam.subjectId,
        description: exam.description || '',
        duration: exam.duration,
        // ✅ convert UTC → Cambodia local time for input display
        startDate: toLocalInput(exam.startDate),
        endDate: toLocalInput(exam.endDate),
        isActive: exam.isActive
      });
      setRandomMode(exam.numberOfQuestions && exam.numberOfQuestions > 0);
      setNumberOfQuestions(exam.numberOfQuestions || '');
      setSelectedQuestions([]);
    } else {
      setEditingExam(null);
      setFormData({
        title: '',
        subjectId: subjects[0]?.id || '',
        description: '',
        duration: 60,
        startDate: '',
        endDate: '',
        isActive: true
      });
      setRandomMode(false);
      setNumberOfQuestions('');
      setSelectedQuestions([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExam(null);
    setSelectedQuestions([]);
    setRandomMode(false);
    setNumberOfQuestions('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId) ? prev.filter(id => id !== questionId) : [...prev, questionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.subjectId || !formData.duration || !formData.startDate || !formData.endDate) {
      toast.error('សូមបំពេញព័ត៌មានឲ្យបានពេញលេញ');
      return;
    }

    // ✅ Validate startDate < endDate
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('ថ្ងៃចាប់ផ្តើមត្រូវតែមុនថ្ងៃបញ្ចប់');
      return;
    }

    const examData = {
      ...formData,
      // ✅ Convert Cambodia local time → UTC before sending to backend
      startDate: toUTCString(formData.startDate),
      endDate: toUTCString(formData.endDate),
    };

    if (randomMode) {
      if (!numberOfQuestions || numberOfQuestions < 1) {
        toast.error('សូមបញ្ចូលចំនួនសំណួរដែលចង់ប្រឡង');
        return;
      }
      examData.numberOfQuestions = parseInt(numberOfQuestions);
      examData.questionIds = [];
    } else {
      if (selectedQuestions.length === 0 && !editingExam) {
        toast.error('សូមជ្រើសរើសសំណួរយ៉ាងហោចណាស់មួយ');
        return;
      }
      examData.questionIds = selectedQuestions;
      examData.numberOfQuestions = null;
    }

    try {
      if (editingExam) {
        await examService.updateExam(editingExam.id, examData);
        toast.success('កែប្រែការប្រឡងបានជោគជ័យ');
      } else {
        await examService.createExam(examData);
        toast.success('បង្កើតការប្រឡងថ្មីបានជោគជ័យ');
      }
      loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'មានបញ្ហា សូមព្យាយាមម្តងទៀត');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបការប្រឡង "${title}" មែនទេ?`)) {
      try {
        await examService.deleteExam(id);
        toast.success('លុបការប្រឡងបានជោគជ័យ');
        loadData();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('មិនអាចលុបការប្រឡងបានទេ');
      }
    }
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'មិនស្គាល់';
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSubjectName(exam.subjectId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">កំពុងផ្ទុកទិន្នន័យ...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">📝 គ្រប់គ្រងការប្រឡង</h3>
          <p className="text-muted">បង្កើត, កែប្រែ, និងគ្រប់គ្រងការប្រឡងទាំងអស់</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" /> បង្កើតការប្រឡងថ្មី
        </button>
      </div>

      {/* Search */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="ស្វែងរកការប្រឡង..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>ចំណងជើង</th>
                  <th>មុខវិជ្ជា</th>
                  <th>រយៈពេល</th>
                  <th>សំណួរ</th>
                  <th>ពិន្ទុ</th>
                  <th>របៀប</th>
                  <th>កាលបរិច្ឆេទ</th>
                  <th>ស្ថានភាព</th>
                  <th>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <FaBook size={40} className="text-muted mb-2" />
                      <p>មិនមានទិន្នន័យការប្រឡង</p>
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam, index) => (
                    <tr key={exam.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <strong>{exam.title}</strong>
                        {exam.description && (
                          <div className="small text-muted">{exam.description.substring(0, 50)}...</div>
                        )}
                      </td>
                      <td>{getSubjectName(exam.subjectId)}</td>
                      <td>{exam.duration} នាទី</td>
                      <td className="text-center">{exam.totalQuestions}</td>
                      <td className="text-center">{exam.totalPoints}</td>
                      <td>
                        {exam.numberOfQuestions ? (
                          <span className="badge bg-info">
                            <FaRandom className="me-1" /> Random {exam.numberOfQuestions}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">កំណត់ដោយខ្លួន</span>
                        )}
                      </td>
                      <td>
                        <small>
                          {/* ✅ display UTC as Cambodia time */}
                          <div>ចាប់ផ្តើម: {formatDate(exam.startDate)}</div>
                          <div>បញ្ចប់: {formatDate(exam.endDate)}</div>
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${exam.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {exam.isActive ? 'សកម្ម' : 'បិទ'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenModal(exam)}><FaEdit /></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(exam.id, exam.title)}><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingExam ? '✏️ កែប្រែការប្រឡង' : '➕ បង្កើតការប្រឡងថ្មី'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ចំណងជើងប្រឡង <span className="text-danger">*</span></label>
                      <input type="text" className="form-control" name="title" value={formData.title} onChange={handleChange} required placeholder="បញ្ចូលចំណងជើងប្រឡង" />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">មុខវិជ្ជា <span className="text-danger">*</span></label>
                      <select className="form-select" name="subjectId" value={formData.subjectId} onChange={handleChange} required>
                        <option value="">ជ្រើសរើសមុខវិជ្ជា</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">ការពិពណ៌នា</label>
                    <textarea className="form-control" name="description" rows="2" value={formData.description} onChange={handleChange} placeholder="ពិពណ៌នាអំពីការប្រឡង..." />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">រយៈពេល (នាទី) <span className="text-danger">*</span></label>
                      <input type="number" className="form-control" name="duration" value={formData.duration} onChange={handleChange} min="1" required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ថ្ងៃចាប់ផ្តើម <span className="text-danger">*</span></label>
                      {/* ✅ Input shows Cambodia local time */}
                      <input type="datetime-local" className="form-control" name="startDate" value={formData.startDate} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ថ្ងៃបញ្ចប់ <span className="text-danger">*</span></label>
                      <input type="datetime-local" className="form-control" name="endDate" value={formData.endDate} onChange={handleChange} required />
                    </div>
                  </div>

                  <hr />
                  <h6 className="mb-3">របៀបជ្រើសរើសសំណួរ</h6>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="questionMode" id="manualMode" checked={!randomMode} onChange={() => setRandomMode(false)} />
                      <label className="form-check-label" htmlFor="manualMode">ជ្រើសរើសសំណួរដោយខ្លួនឯង</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="questionMode" id="randomMode" checked={randomMode} onChange={() => setRandomMode(true)} />
                      <label className="form-check-label" htmlFor="randomMode">Random ចាប់យកសំណួរ (ចំនួន: <input type="number" className="form-control form-control-sm d-inline-block ms-1" style={{ width: '80px' }} min="1" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(e.target.value)} /> សំណួរ)</label>
                    </div>
                  </div>

                  {!randomMode && (
                    <>
                      <hr />
                      <h6 className="mb-3"><FaBook className="me-2" />ជ្រើសរើសសំណួរ ({selectedQuestions.length} សំណួរ)</h6>
                      <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {questions.filter(q => q.subjectId === parseInt(formData.subjectId)).length === 0 ? (
                          <p className="text-muted text-center">មិនមានសំណួរសម្រាប់មុខវិជ្ជានេះទេ</p>
                        ) : (
                          questions.filter(q => q.subjectId === parseInt(formData.subjectId)).map((q, idx) => (
                            <div key={q.id} className="form-check mb-2">
                              <input className="form-check-input" type="checkbox" id={`q${q.id}`} checked={selectedQuestions.includes(q.id)} onChange={() => handleQuestionToggle(q.id)} />
                              <label className="form-check-label" htmlFor={`q${q.id}`}>
                                <strong>{idx + 1}.</strong> {q.questionText.substring(0, 100)}...
                                <span className="badge bg-info ms-2">{q.points} ពិន្ទុ</span>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>បោះបង់</button>
                  <button type="submit" className="btn btn-primary">{editingExam ? 'រក្សាទុក' : 'បង្កើត'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;