import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaChalkboardTeacher, FaBook, FaQuestionCircle, FaChartLine, FaSignOutAlt, FaUsers, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import teacherService from '../../services/teacherService';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState({ totalQuestions: 0, totalStudents: 0 });
  const [questions, setQuestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [questionForm, setQuestionForm] = useState({
    subjectId: '',
    questionText: '',
    option_a: '', option_b: '', option_c: '', option_d: '',
    correctAnswer: 'a', explanation: '', difficulty: 'medium', points: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsData, statsData] = await Promise.all([
        teacherService.getMySubjects(),
        teacherService.getMyStats()
      ]);
      setSubjects(subjectsData);
      setStats(statsData);
      if (subjectsData.length > 0) setSelectedSubjectId(subjectsData[0].id);
    } catch (error) {
      console.error(error);
      toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const params = {};
      if (selectedSubjectId) params.subjectId = selectedSubjectId;
      if (searchTerm) params.search = searchTerm;
      const data = await teacherService.getMyQuestions(params);
      setQuestions(data);
    } catch (error) {
      toast.error('មិនអាចផ្ទុកសំណួរបានទេ');
    }
  };

  const loadReports = async () => {
    try {
      const data = await teacherService.getMyReports();
      setReports(data);
    } catch (error) {
      toast.error('មិនអាចផ្ទុករបាយការណ៍បានទេ');
    }
  };

  useEffect(() => {
    if (activeTab === 'questions') {
      loadQuestions();
    } else if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, selectedSubjectId, searchTerm]);

  const handleLogout = () => {
    logout();
    toast.success('ចាកចេញពីប្រព័ន្ធដោយជោគជ័យ');
    navigate('/login');
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionForm({
      subjectId: subjects[0]?.id || '',
      questionText: '',
      option_a: '', option_b: '', option_c: '', option_d: '',
      correctAnswer: 'a', explanation: '', difficulty: 'medium', points: 1
    });
    setShowQuestionModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      subjectId: q.subjectId,
      questionText: q.questionText,
      option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
      correctAnswer: q.correctAnswer, explanation: q.explanation || '', difficulty: q.difficulty, points: q.points
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
      } catch (error) {
        toast.error('មិនអាចលុបបានទេ');
      }
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('km-KH');

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary" /></div>;
  }

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
              <button onClick={handleLogout} className="btn btn-light"><FaSignOutAlt className="me-2" /> ចាកចេញ</button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
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
            <li className="nav-item"><button className={`nav-link ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}><FaBook className="me-2" />មុខវិជ្ជា</button></li>
            <li className="nav-item"><button className={`nav-link ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}><FaQuestionCircle className="me-2" />គ្រប់គ្រងសំណួរ</button></li>
            <li className="nav-item"><button className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><FaChartLine className="me-2" />របាយការណ៍</button></li>
          </ul>
        </div>

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <div className="col-md-12">
            {subjects.length === 0 ? (
              <div className="card shadow-sm text-center py-5"><FaBook size={50} className="text-muted mb-3" /><h5>គ្មានមុខវិជ្ជា</h5><p className="text-muted">សូមទាក់ទងអ្នកគ្រប់គ្រង</p></div>
            ) : (
              <div className="row">
                {subjects.map(sub => (
                  <div className="col-md-4 mb-4" key={sub.id}>
                    <div className="card shadow-sm h-100">
                      <div className="card-body">
                        <h5>{sub.name}</h5>
                        <p className="text-muted small">{sub.description}</p>
                        <span className={`badge ${sub.isActive ? 'bg-success' : 'bg-secondary'}`}>{sub.isActive ? 'សកម្ម' : 'បិទ'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="col-md-12">
            <div className="d-flex justify-content-between mb-3">
              <div className="d-flex gap-2">
                <select className="form-select w-auto" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="text" className="form-control" placeholder="ស្វែងរក..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={openCreateModal}><FaPlus /> បន្ថែមសំណួរ</button>
            </div>
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light"><tr><th>សំណួរ</th><th>ជម្រើស A</th><th>B</th><th>C</th><th>D</th><th>ត្រូវ</th><th>សកម្មភាព</th></tr></thead>
                  <tbody>
                    {questions.map(q => (
                      <tr key={q.id}>
                        <td>{q.questionText.substring(0, 50)}...</td>
                        <td>{q.option_a.substring(0, 20)}</td><td>{q.option_b.substring(0, 20)}</td><td>{q.option_c.substring(0, 20)}</td><td>{q.option_d.substring(0, 20)}</td>
                        <td>{q.correctAnswer.toUpperCase()}</td>
                        <td><button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEditModal(q)}><FaEdit /></button><button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteQuestion(q.id)}><FaTrash /></button></td>
                      </tr>
                    ))}
                    {questions.length === 0 && <tr><td colSpan="7" className="text-center">មិនមានសំណួរ</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="col-md-12">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light"><tr><th>សិស្ស</th><th>អ៊ីមែល</th><th>ការប្រឡង</th><th>មុខវិជ្ជា</th><th>ពិន្ទុ</th><th>ភាគរយ</th><th>ថ្ងៃប្រឡង</th></tr></thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r.id}>
                          <td>{r.studentName}</td><td>{r.studentEmail}</td><td>{r.examTitle}</td><td>{r.subjectName}</td>
                          <td>{r.totalScore} / {r.totalPoints}</td>
                          <td>
                            <span className={`badge ${parseFloat(r.percentage || 0) >= 70 ? 'bg-success' : parseFloat(r.percentage || 0) >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                              {parseFloat(r.percentage || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td>{formatDate(r.submittedAt)}</td>
                        </tr>
                      ))}
                      {reports.length === 0 && <tr><td colSpan="7" className="text-center">មិនមានលទ្ធផលប្រឡង</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit Question */}
      {showQuestionModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header"><h5>{editingQuestion ? 'កែប្រែសំណួរ' : 'បន្ថែមសំណួរ'}</h5><button className="btn-close" onClick={() => setShowQuestionModal(false)}></button></div>
              <form onSubmit={handleQuestionSubmit}>
                <div className="modal-body">
                  <select className="form-select mb-2" value={questionForm.subjectId} onChange={e => setQuestionForm({...questionForm, subjectId: e.target.value})} required>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <textarea className="form-control mb-2" rows="2" placeholder="សំណួរ" value={questionForm.questionText} onChange={e => setQuestionForm({...questionForm, questionText: e.target.value})} required></textarea>
                  <input className="form-control mb-2" placeholder="ជម្រើស A" value={questionForm.option_a} onChange={e => setQuestionForm({...questionForm, option_a: e.target.value})} required />
                  <input className="form-control mb-2" placeholder="ជម្រើស B" value={questionForm.option_b} onChange={e => setQuestionForm({...questionForm, option_b: e.target.value})} required />
                  <input className="form-control mb-2" placeholder="ជម្រើស C" value={questionForm.option_c} onChange={e => setQuestionForm({...questionForm, option_c: e.target.value})} required />
                  <input className="form-control mb-2" placeholder="ជម្រើស D" value={questionForm.option_d} onChange={e => setQuestionForm({...questionForm, option_d: e.target.value})} required />
                  <select className="form-select mb-2" value={questionForm.correctAnswer} onChange={e => setQuestionForm({...questionForm, correctAnswer: e.target.value})}>
                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                  </select>
                  <input type="number" className="form-control mb-2" placeholder="ពិន្ទុ" value={questionForm.points} onChange={e => setQuestionForm({...questionForm, points: e.target.value})} />
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowQuestionModal(false)}>បោះបង់</button><button type="submit" className="btn btn-primary">រក្សាទុក</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;