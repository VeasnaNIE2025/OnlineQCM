import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaBookOpen, FaHistory, FaSignOutAlt, FaClock, FaCalendarAlt, FaLock, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import studentExamService from '../../services/studentExamService';

// ✅ Parse DB UTC date string correctly
const parseDBDate = (str) => {
  if (!str) return null;
  const normalized = str.toString().replace(' ', 'T');
  return new Date(normalized.endsWith('Z') ? normalized : normalized + 'Z');
};

// ✅ Display UTC date as Cambodia local time
const formatCambodiaDate = (str) => {
  const d = parseDBDate(str);
  if (!d) return '';
  return d.toLocaleString('km-KH', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
};

// ── Countdown hook ──────────────────────────────────────────────
const useCountdown = (targetDateStr) => {
  const calc = useCallback(() => {
    if (!targetDateStr) return null;
    const target = parseDBDate(targetDateStr);
    const diff = target - new Date();
    if (diff <= 0) return null;
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [targetDateStr]);

  const [remaining, setRemaining] = useState(calc);

  useEffect(() => {
    setRemaining(calc());
    const id = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return remaining;
};

// ── ExamCard ────────────────────────────────────────────────────
const ExamCard = ({ exam, alreadyTaken, onStart }) => {
  // ✅ FIX: លុប useState(new Date()) ចោល — useCountdown drive re-render រួចហើយ
  const startDate = parseDBDate(exam.startDate);
  const endDate = parseDBDate(exam.endDate);
  const now = new Date(); // គណនា fresh ក្នុង render
  const notStarted = now < startDate;
  const expired = now > endDate;
  const countdown = useCountdown(notStarted ? exam.startDate : null);
  const pad = (n) => String(n).padStart(2, '0');

  let statusBadge = null;
  if (alreadyTaken) {
    statusBadge = <span className="badge bg-success mb-2"><FaCheckCircle className="me-1" />បានប្រឡងរួចហើយ</span>;
  } else if (expired) {
    statusBadge = <span className="badge bg-secondary mb-2">អស់ពេល</span>;
  } else if (notStarted) {
    statusBadge = <span className="badge bg-warning text-dark mb-2"><FaClock className="me-1" />មិនទាន់ដល់ម៉ោង</span>;
  } else {
    statusBadge = <span className="badge bg-primary mb-2">កំពុងបើក</span>;
  }

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className={`card shadow-sm h-100 ${alreadyTaken ? 'border-success' : notStarted ? 'border-warning' : ''}`}>
        <div className="card-body d-flex flex-column">

          <div>{statusBadge}</div>
          <h5 className="card-title">{exam.title}</h5>
          <p className="card-text text-muted small">{exam.subjectName}</p>
          <p className="card-text">{exam.description}</p>
          <hr />

          <div className="small text-muted mb-2">
            <div><FaClock className="me-2" />រយៈពេល: {exam.duration} នាទី</div>
            <div><FaCalendarAlt className="me-2" />សំណួរ: {exam.totalQuestions}</div>
            <div><FaCalendarAlt className="me-2" />ពិន្ទុសរុប: {exam.totalPoints}</div>
            <div><FaCalendarAlt className="me-2" />ចាប់ផ្តើម: {formatCambodiaDate(exam.startDate)}</div>
            <div><FaCalendarAlt className="me-2" />បញ្ចប់: {formatCambodiaDate(exam.endDate)}</div>
          </div>

          {/* Countdown timer */}
          {notStarted && countdown && (
            <div className="alert alert-warning py-2 px-3 mb-2 text-center">
              <small className="d-block text-muted mb-1">ចាប់ផ្តើមក្នុង</small>
              <span className="fw-bold fs-5 font-monospace">
                {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
              </span>
            </div>
          )}

          {/* Button */}
          <div className="mt-auto">
            {alreadyTaken ? (
              <button className="btn btn-success w-100" disabled>
                <FaCheckCircle className="me-2" />បានប្រឡងរួចហើយ
              </button>
            ) : notStarted ? (
              <button className="btn btn-warning w-100" disabled>
                <FaLock className="me-2" />រង់ចាំម៉ោងចាប់ផ្តើម
              </button>
            ) : expired ? (
              <button className="btn btn-secondary w-100" disabled>
                <FaLock className="me-2" />អស់ពេលប្រឡង
              </button>
            ) : (
              <button
                className="btn btn-primary w-100"
                onClick={() => onStart(exam)}
              >
                ចាប់ផ្តើមប្រឡង
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// ── StudentDashboard ─────────────────────────────────────────────
const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('exams');

  useEffect(() => {
    loadData();
  }, []);

  // ✅ FIX: debug logs ផ្លាស់ទៅ useEffect — run តែពេល data ផ្លាស់ប្តូរ
  useEffect(() => {
    if (!loading) {
      console.log('[Dashboard] exams:', exams.map(e => ({ id: e.id, title: e.title })));
      console.log('[Dashboard] results:', results.map(r => ({ id: r.id, examId: r.examId })));
      console.log('[Dashboard] takenExamIds:', results.map(r => r.examId));
    }
  }, [exams, results, loading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examsData, resultsData] = await Promise.all([
        studentExamService.getAvailableExams(),
        studentExamService.getMyResults()
      ]);
      setExams(examsData);
      setResults(resultsData);
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: useMemo ដើម្បីកុំ recompute រៀងរាល់ render
  const takenExamIds = React.useMemo(
    () => new Set(results.map(r => r.examId)),
    [results]
  );

  const handleStartExam = (exam) => {
    navigate(`/student/exam/${exam.id}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('ចាកចេញពីប្រព័ន្ធដោយជោគជ័យ');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 fade-in">
      <div className="row">

        {/* Header */}
        <div className="col-md-12 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2>ស្វាគមន៍, {user?.fullName}!</h2>
                  <p className="text-muted">ត្រៀមប្រឡងរបស់អ្នកនៅទីនេះ</p>
                </div>
                <button onClick={handleLogout} className="btn btn-danger">
                  <FaSignOutAlt className="me-2" />ចាកចេញ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="col-md-12 mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'exams' ? 'active' : ''}`}
                onClick={() => setActiveTab('exams')}
              >
                <FaBookOpen className="me-2" />ការប្រឡងដែលអាចធ្វើបាន
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <FaHistory className="me-2" />ប្រវត្តិនៃការប្រឡង
              </button>
            </li>
          </ul>
        </div>

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <div className="col-md-12">
            {exams.length === 0 ? (
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <FaBookOpen size={50} className="text-muted mb-3" />
                  <h5>មិនមានការប្រឡងនៅពេលនេះទេ</h5>
                  <p className="text-muted">សូមមេត្តាត្រឡប់មកវិញនៅពេលក្រោយ</p>
                </div>
              </div>
            ) : (
              <div className="row">
                {exams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    alreadyTaken={takenExamIds.has(exam.id)}
                    onStart={handleStartExam}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="col-md-12">
            <div className="card shadow-sm">
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ការប្រឡង</th>
                        <th>មុខវិជ្ជា</th>
                        <th>ពិន្ទុ</th>
                        <th>ភាគរយ</th>
                        <th>ថ្ងៃប្រឡង</th>
                        <th>ស្ថានភាព</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <p className="text-muted">មិនទាន់មានប្រវត្តិនៃការប្រឡងនៅឡើយទេ</p>
                          </td>
                        </tr>
                      ) : (
                        results.map((result) => (
                          <tr key={result.id}>
                            <td><strong>{result.examTitle}</strong></td>
                            <td>{result.subjectName}</td>
                            <td>{result.totalScore} / {result.totalPoints}</td>
                            <td>
                              <span className={`badge ${result.percentage >= 70 ? 'bg-success' : result.percentage >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                                {parseFloat(result.percentage).toFixed(1)}%
                              </span>
                            </td>
                            <td>{formatCambodiaDate(result.submittedAt)}</td>
                            <td><span className="badge bg-success">បានប្រឡង</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;