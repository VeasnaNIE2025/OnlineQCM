import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaBook, FaQuestionCircle, FaChartLine, FaSignOutAlt,
  FaUsers, FaEdit, FaTrash, FaPlus, FaClipboardList, FaArrowLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';
import teacherService from '../../services/teacherService';
import CreateAssignment from '../../components/teacher/CreateAssignment';
import GradeSubmission from '../../components/teacher/GradeSubmission';
import assignmentService from '../../services/assignmentService';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects]         = useState([]);
  const [stats, setStats]               = useState({ totalQuestions: 0, totalStudents: 0 });
  const [questions, setQuestions]       = useState([]);
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('subjects');

  // Assignment states
  const [assignments, setAssignments]         = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [assignmentView, setAssignmentView]   = useState('list'); // 'list' | 'create' | 'grade'

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion]     = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [searchTerm, setSearchTerm]               = useState('');
  const [questionForm, setQuestionForm] = useState({
    subjectId: '', questionText: '',
    option_a: '', option_b: '', option_c: '', option_d: '',
    correctAnswer: 'a', explanation: '', difficulty: 'medium', points: 1
  });

  useEffect(() => { loadData(); }, []);

const loadData = async () => {
  try {
    setLoading(true);

    // ── ហៅ api ផ្ទាល់ — មិនពឹង teacherService ──────────
    const [subjectsRes, statsRes] = await Promise.all([
      api.get('/teacher/subjects'),   // ← api ផ្ទាល់
      api.get('/teacher/stats')       // ← api ផ្ទាល់
    ]);

    const subjectsData = subjectsRes.data?.subjects || subjectsRes.data || [];
    const statsData    = statsRes.data?.stats        || statsRes.data    || { totalQuestions: 0, totalStudents: 0 };

    setSubjects(subjectsData);
    setStats(statsData);
    if (subjectsData.length > 0) setSelectedSubjectId(subjectsData[0].id);
  } catch (error) {
    toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
  } finally {
    setLoading(false);
  }
};

  const loadQuestions = useCallback(async () => {
    try {
      const params = {};
      if (selectedSubjectId) params.subjectId = selectedSubjectId;
      if (searchTerm) params.search = searchTerm;
      const data = await teacherService.getMyQuestions(params);
      setQuestions(data);
    } catch { toast.error('មិនអាចផ្ទុកសំណួរបានទេ'); }
  }, [selectedSubjectId, searchTerm]);

  const loadReports = useCallback(async () => {
    try {
      const data = await teacherService.getMyReports();
      setReports(data);
    } catch { toast.error('មិនអាចផ្ទុករបាយការណ៍បានទេ'); }
  }, []);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await assignmentService.getTeacherAssignments();
      setAssignments(res.data?.assignments || res.data || []);
    } catch { toast.error('មិនអាចផ្ទុកកិច្ចការបានទេ'); }
  }, []);

  useEffect(() => {
    if (activeTab === 'questions')   loadQuestions();
    if (activeTab === 'reports')     loadReports();
    if (activeTab === 'assignments') loadAssignments();
  }, [activeTab, loadQuestions, loadReports, loadAssignments]);

  const handleLogout = () => {
    logout();
    toast.success('ចាកចេញពីប្រព័ន្ធដោយជោគជ័យ');
    navigate('/login');
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      subjectId: subjects[0]?.id || '', questionText: '',
      option_a: '', option_b: '', option_c: '', option_d: '',
      correctAnswer: 'a', explanation: '', difficulty: 'medium', points: 1
    });
    setShowQuestionModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      subjectId: q.subjectId, questionText: q.questionText,
      option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
      correctAnswer: q.correctAnswer, explanation: q.explanation || '',
      difficulty: q.difficulty, points: q.points
    });
    setShowQuestionModal(true);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await teacherService.updateMyQuestion(editingQuestion.id, questionForm);
        toast.success('កែប្រែសំណួរបានជោគជ័យ');
      } else {
        await teacherService.createMyQuestion(questionForm);
        toast.success('បង្កើតសំណួរបានជោគជ័យ');
      }
      setShowQuestionModal(false);
      loadQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'មានបញ្ហា');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបសំណួរនេះមែនទេ?')) {
      try {
        await teacherService.deleteMyQuestion(id);
        toast.success('លុបសំណួរបានជោគជ័យ');
        loadQuestions();
      } catch { toast.error('មិនអាចលុបបានទេ'); }
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('km-KH');

  const isOverdue = (dueDate) => new Date() > new Date(dueDate);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" />
    </div>
  );

  return (
    <div className="container mt-4 fade-in">
      <div className="row">

        {/* Header */}
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm border-0 bg-primary text-white">
            <div className="card-body p-4 d-flex justify-content-between align-items-center">
              <div>
                <h2>ស្វាគមន៍, {user?.fullName}!</h2>
                <p className="text-white-50">តួនាទី: គ្រូបង្រៀន</p>
              </div>
              <button onClick={handleLogout} className="btn btn-light">
                <FaSignOutAlt className="me-2" />ចាកចេញ
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body"><FaBook size={30} className="text-primary mb-2" /><h3>{subjects.length}</h3><p className="text-muted">មុខវិជ្ជា</p></div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body"><FaQuestionCircle size={30} className="text-success mb-2" /><h3>{stats.totalQuestions}</h3><p className="text-muted">សំណួរសរុប</p></div>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0 text-center">
            <div className="card-body"><FaUsers size={30} className="text-info mb-2" /><h3>{stats.totalStudents}</h3><p className="text-muted">សិស្ស</p></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="col-md-12 mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'subjects' ? 'active' : ''}`}
                onClick={() => setActiveTab('subjects')}>
                <FaBook className="me-2" />មុខវិជ្ជា
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('questions')}>
                <FaQuestionCircle className="me-2" />គ្រប់គ្រងសំណួរ
              </button>
            </li>
            {/* ✅ Tab កិច្ចការ */}
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'assignments' ? 'active' : ''}`}
                onClick={() => { setActiveTab('assignments'); setAssignmentView('list'); }}>
                <FaClipboardList className="me-2" />កិច្ចការ
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => setActiveTab('reports')}>
                <FaChartLine className="me-2" />របាយការណ៍
              </button>
            </li>
          </ul>
        </div>

        {/* ── Subjects Tab ── */}
        {activeTab === 'subjects' && (
          <div className="col-md-12">
            {subjects.length === 0 ? (
              <div className="card shadow-sm text-center py-5">
                <FaBook size={50} className="text-muted mb-3" />
                <h5>គ្មានមុខវិជ្ជា</h5>
                <p className="text-muted">សូមទាក់ទងអ្នកគ្រប់គ្រង</p>
              </div>
            ) : (
              <div className="row">
                {subjects.map(sub => (
                  <div className="col-md-4 mb-4" key={sub.id}>
                    <div className="card shadow-sm h-100">
                      <div className="card-body">
                        <h5>{sub.name}</h5>
                        <p className="text-muted small">{sub.description}</p>
                        <span className={`badge ${sub.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {sub.isActive ? 'សកម្ម' : 'បិទ'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Questions Tab ── */}
        {activeTab === 'questions' && (
          <div className="col-md-12">
            <div className="d-flex justify-content-between mb-3">
              <div className="d-flex gap-2">
                <select className="form-select w-auto" value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="text" className="form-control" placeholder="ស្វែងរក..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={openCreateModal}>
                <FaPlus /> បន្ថែមសំណួរ
              </button>
            </div>
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr><th>សំណួរ</th><th>A</th><th>B</th><th>C</th><th>D</th><th>ត្រូវ</th><th>សកម្មភាព</th></tr>
                  </thead>
                  <tbody>
                    {questions.map(q => (
                      <tr key={q.id}>
                        <td>{q.questionText.substring(0, 50)}...</td>
                        <td>{q.option_a.substring(0, 20)}</td>
                        <td>{q.option_b.substring(0, 20)}</td>
                        <td>{q.option_c.substring(0, 20)}</td>
                        <td>{q.option_d.substring(0, 20)}</td>
                        <td>{q.correctAnswer.toUpperCase()}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEditModal(q)}><FaEdit /></button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteQuestion(q.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                    {questions.length === 0 && (
                      <tr><td colSpan="7" className="text-center py-3">មិនមានសំណួរ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Assignments Tab ── */}
        {activeTab === 'assignments' && (
          <div className="col-md-12">

            {/* View: List */}
            {assignmentView === 'list' && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">បញ្ជីកិច្ចការ</h5>
                  <button className="btn btn-primary btn-sm"
                    onClick={() => setAssignmentView('create')}>
                    <FaPlus className="me-1" />បង្កើតកិច្ចការថ្មី
                  </button>
                </div>

                {assignments.length === 0 ? (
                  <div className="card shadow-sm text-center py-5">
                    <FaClipboardList size={50} className="text-muted mb-3" />
                    <h5>មិនទាន់មានកិច្ចការ</h5>
                    <button className="btn btn-primary mt-2"
                      onClick={() => setAssignmentView('create')}>
                      <FaPlus className="me-1" />បង្កើតដំបូង
                    </button>
                  </div>
                ) : (
                  <div className="row">
                    {assignments.map(a => (
                      <div className="col-md-6 mb-4" key={a.id}>
                        <div className="card shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="mb-0 fw-bold">{a.title}</h6>
                              <span className={`badge ${isOverdue(a.dueDate) ? 'bg-danger' : 'bg-success'}`}>
                                {isOverdue(a.dueDate) ? 'ផុតកំណត់' : 'បើក'}
                              </span>
                            </div>
                            <p className="text-muted small mb-2">{a.Subject?.name || a.subjectName}</p>
                            {a.description && (
                              <p className="small mb-2">{a.description}</p>
                            )}
                            <div className="d-flex gap-3 text-muted small mb-3">
                              <span>📅 {new Date(a.dueDate).toLocaleString('km-KH')}</span>
                              <span>⭐ {a.totalPoints} ពិន្ទុ</span>
                              <span>📄 {a.submissionCount || 0} ស្នាដៃ</span>
                            </div>
                            <button
                              className="btn btn-outline-primary btn-sm w-100"
                              onClick={() => {
                                setSelectedAssignmentId(a.id);
                                setAssignmentView('grade');
                              }}>
                              👁 មើល/ដាក់ពិន្ទុស្នាដៃ
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* View: Create */}
            {assignmentView === 'create' && (
              <>
                <button className="btn btn-outline-secondary btn-sm mb-3"
                  onClick={() => setAssignmentView('list')}>
                  <FaArrowLeft className="me-1" />ត្រឡប់ទៅបញ្ជី
                </button>
                <CreateAssignment onCreated={() => {
                  setAssignmentView('list');
                  loadAssignments();
                  toast.success('បង្កើតកិច្ចការដោយជោគជ័យ!');
                }} />
              </>
            )}

            {/* View: Grade */}
            {assignmentView === 'grade' && selectedAssignmentId && (
              <>
                <button className="btn btn-outline-secondary btn-sm mb-3"
                  onClick={() => { setAssignmentView('list'); setSelectedAssignmentId(null); }}>
                  <FaArrowLeft className="me-1" />ត្រឡប់ទៅបញ្ជី
                </button>
                <GradeSubmission assignmentId={selectedAssignmentId} />
              </>
            )}
          </div>
        )}

        {/* ── Reports Tab ── */}
        {activeTab === 'reports' && (
          <div className="col-md-12">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr><th>សិស្ស</th><th>អ៊ីមែល</th><th>ការប្រឡង</th><th>មុខវិជ្ជា</th><th>ពិន្ទុ</th><th>ភាគរយ</th><th>ថ្ងៃប្រឡង</th></tr>
                    </thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r.id}>
                          <td>{r.studentName}</td>
                          <td>{r.studentEmail}</td>
                          <td>{r.examTitle}</td>
                          <td>{r.subjectName}</td>
                          <td>{r.totalScore} / {r.totalPoints}</td>
                          <td>
                            <span className={`badge ${parseFloat(r.percentage || 0) >= 70 ? 'bg-success' : parseFloat(r.percentage || 0) >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                              {parseFloat(r.percentage || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td>{formatDate(r.submittedAt)}</td>
                        </tr>
                      ))}
                      {reports.length === 0 && (
                        <tr><td colSpan="7" className="text-center py-3">មិនមានលទ្ធផលប្រឡង</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editingQuestion ? 'កែប្រែសំណួរ' : 'បន្ថែមសំណួរ'}</h5>
                <button className="btn-close" onClick={() => setShowQuestionModal(false)} />
              </div>
              <form onSubmit={handleQuestionSubmit}>
                <div className="modal-body">
                  <select className="form-select mb-2" value={questionForm.subjectId}
                    onChange={e => setQuestionForm({ ...questionForm, subjectId: e.target.value })} required>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <textarea className="form-control mb-2" rows="2" placeholder="សំណួរ"
                    value={questionForm.questionText}
                    onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })} required />
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <input key={opt} className="form-control mb-2" placeholder={`ជម្រើស ${opt.toUpperCase()}`}
                      value={questionForm[`option_${opt}`]}
                      onChange={e => setQuestionForm({ ...questionForm, [`option_${opt}`]: e.target.value })} required />
                  ))}
                  <select className="form-select mb-2" value={questionForm.correctAnswer}
                    onChange={e => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}>
                    <option value="a">A</option><option value="b">B</option>
                    <option value="c">C</option><option value="d">D</option>
                  </select>
                  <input type="number" className="form-control mb-2" placeholder="ពិន្ទុ"
                    value={questionForm.points}
                    onChange={e => setQuestionForm({ ...questionForm, points: e.target.value })} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary"
                    onClick={() => setShowQuestionModal(false)}>បោះបង់</button>
                  <button type="submit" className="btn btn-primary">រក្សាទុក</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;