// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { FaBookOpen, FaHistory, FaSignOutAlt, FaClock, FaCalendarAlt, FaLock, FaCheckCircle } from 'react-icons/fa';
// import toast from 'react-hot-toast';
// import studentExamService from '../../services/studentExamService';

// // ── Countdown hook ──────────────────────────────────────────────
// const useCountdown = (targetDate) => {
//   const calc = useCallback(() => {
//     const diff = new Date(targetDate) - new Date();
//     if (diff <= 0) return null;
//     const h = Math.floor(diff / 3600000);
//     const m = Math.floor((diff % 3600000) / 60000);
//     const s = Math.floor((diff % 60000) / 1000);
//     return { h, m, s, diff };
//   }, [targetDate]);

//   const [remaining, setRemaining] = useState(calc);

//   useEffect(() => {
//     const id = setInterval(() => setRemaining(calc()), 1000);
//     return () => clearInterval(id);
//   }, [calc]);

//   return remaining;
// };

// // ── ExamCard ────────────────────────────────────────────────────
// const ExamCard = ({ exam, alreadyTaken, onStart }) => {
//   const now = new Date();
//   const startDate = new Date(exam.startDate);
//   const endDate = new Date(exam.endDate);
//   const notStarted = now < startDate;
//   const expired = now > endDate;
//   const countdown = useCountdown(notStarted ? exam.startDate : null);

//   const pad = (n) => String(n).padStart(2, '0');

//   const isDisabled = notStarted || expired || alreadyTaken;

//   let statusBadge = null;
//   if (alreadyTaken) {
//     statusBadge = (
//       <span className="badge bg-success mb-2">
//         <FaCheckCircle className="me-1" /> បានប្រឡងរួចហើយ
//       </span>
//     );
//   } else if (expired) {
//     statusBadge = <span className="badge bg-secondary mb-2">អស់ពេល</span>;
//   } else if (notStarted) {
//     statusBadge = <span className="badge bg-warning text-dark mb-2"><FaClock className="me-1" />មិនទាន់ដល់ម៉ោង</span>;
//   } else {
//     statusBadge = <span className="badge bg-primary mb-2">កំពុងបើក</span>;
//   }

//   return (
//     <div className="col-md-6 col-lg-4 mb-4">
//       <div className={`card shadow-sm h-100 ${alreadyTaken ? 'border-success' : notStarted ? 'border-warning' : ''}`}>
//         <div className="card-body d-flex flex-column">

//           {/* Status badge */}
//           <div>{statusBadge}</div>

//           <h5 className="card-title">{exam.title}</h5>
//           <p className="card-text text-muted small">{exam.subjectName}</p>
//           <p className="card-text">{exam.description}</p>

//           <hr />

//           <div className="small text-muted mb-2">
//             <div><FaClock className="me-2" />រយៈពេល: {exam.duration} នាទី</div>
//             <div><FaCalendarAlt className="me-2" />សំណួរ: {exam.totalQuestions}</div>
//             <div><FaCalendarAlt className="me-2" />ពិន្ទុសរុប: {exam.totalPoints}</div>
//             <div><FaCalendarAlt className="me-2" />ចាប់ផ្តើម: {new Date(exam.startDate).toLocaleString('km-KH')}</div>
//             <div><FaCalendarAlt className="me-2" />បញ្ចប់: {new Date(exam.endDate).toLocaleString('km-KH')}</div>
//           </div>

//           {/* Countdown */}
//           {notStarted && countdown && (
//             <div className="alert alert-warning py-2 px-3 mb-2 text-center">
//               <small className="d-block text-muted mb-1">ចាប់ផ្តើមក្នុង</small>
//               <span className="fw-bold fs-5 font-monospace">
//                 {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
//               </span>
//             </div>
//           )}

//           {/* Button */}
//           <div className="mt-auto">
//             {alreadyTaken ? (
//               <button className="btn btn-success w-100" disabled>
//                 <FaCheckCircle className="me-2" />បានប្រឡងរួចហើយ
//               </button>
//             ) : notStarted ? (
//               <button className="btn btn-warning w-100" disabled>
//                 <FaLock className="me-2" />រង់ចាំម៉ោងចាប់ផ្តើម
//               </button>
//             ) : expired ? (
//               <button className="btn btn-secondary w-100" disabled>
//                 <FaLock className="me-2" />អស់ពេលប្រឡង
//               </button>
//             ) : (
//               <button className="btn btn-primary w-100" onClick={() => onStart(exam)}>
//                 ចាប់ផ្តើមប្រឡង
//               </button>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };

// // ── StudentDashboard ─────────────────────────────────────────────
// const StudentDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [exams, setExams] = useState([]);
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('exams');

//   useEffect(() => { loadData(); }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [examsData, resultsData] = await Promise.all([
//         studentExamService.getAvailableExams(),
//         studentExamService.getMyResults()
//       ]);
//       setExams(examsData);
//       setResults(resultsData);
//     } catch (error) {
//       console.error('Load data error:', error);
//       toast.error('មិនអាចផ្ទុកទិន្នន័យបានទេ');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // IDs of exams already taken
//   const takenExamIds = new Set(results.map(r => r.examId));

//   const handleStartExam = (exam) => navigate(`/student/exam/${exam.id}`);

//   const handleLogout = () => {
//     logout();
//     toast.success('ចាកចេញពីប្រព័ន្ធដោយជោគជ័យ');
//     navigate('/login');
//   };

//   const formatDate = (date) => new Date(date).toLocaleString('km-KH');

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center vh-100">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mt-4 fade-in">
//       <div className="row">

//         {/* Header */}
//         <div className="col-md-12 mb-4">
//           <div className="card shadow-sm border-0">
//             <div className="card-body p-4">
//               <div className="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h2>ស្វាគមន៍, {user?.fullName}!</h2>
//                   <p className="text-muted">ត្រៀមប្រឡងរបស់អ្នកនៅទីនេះ</p>
//                 </div>
//                 <button onClick={handleLogout} className="btn btn-danger">
//                   <FaSignOutAlt className="me-2" /> ចាកចេញ
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="col-md-12 mb-4">
//           <ul className="nav nav-tabs">
//             <li className="nav-item">
//               <button className={`nav-link ${activeTab === 'exams' ? 'active' : ''}`} onClick={() => setActiveTab('exams')}>
//                 <FaBookOpen className="me-2" />ការប្រឡងដែលអាចធ្វើបាន
//               </button>
//             </li>
//             <li className="nav-item">
//               <button className={`nav-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
//                 <FaHistory className="me-2" />ប្រវត្តិនៃការប្រឡង
//               </button>
//             </li>
//           </ul>
//         </div>

//         {/* Exams Tab */}
//         {activeTab === 'exams' && (
//           <div className="col-md-12">
//             {exams.length === 0 ? (
//               <div className="card shadow-sm">
//                 <div className="card-body text-center py-5">
//                   <FaBookOpen size={50} className="text-muted mb-3" />
//                   <h5>មិនមានការប្រឡងនៅពេលនេះទេ</h5>
//                   <p className="text-muted">សូមមេត្តាត្រឡប់មកវិញនៅពេលក្រោយ</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="row">
//                 {exams.map((exam) => (
//                   <ExamCard
//                     key={exam.id}
//                     exam={exam}
//                     alreadyTaken={takenExamIds.has(exam.id)}
//                     onStart={handleStartExam}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* History Tab */}
//         {activeTab === 'history' && (
//           <div className="col-md-12">
//             <div className="card shadow-sm">
//               <div className="card-body p-0">
//                 <div className="table-responsive">
//                   <table className="table table-hover mb-0">
//                     <thead className="table-light">
//                       <tr>
//                         <th>ការប្រឡង</th>
//                         <th>មុខវិជ្ជា</th>
//                         <th>ពិន្ទុ</th>
//                         <th>ភាគរយ</th>
//                         <th>ថ្ងៃប្រឡង</th>
//                         <th>ស្ថានភាព</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {results.length === 0 ? (
//                         <tr>
//                           <td colSpan="6" className="text-center py-5">
//                             <p className="text-muted">មិនទាន់មានប្រវត្តិនៃការប្រឡងនៅឡើយទេ</p>
//                           </td>
//                         </tr>
//                       ) : (
//                         results.map((result) => (
//                           <tr key={result.id}>
//                             <td><strong>{result.examTitle}</strong></td>
//                             <td>{result.subjectName}</td>
//                             <td>{result.totalScore} / {result.totalPoints}</td>
//                             <td>
//                               <span className={`badge ${result.percentage >= 70 ? 'bg-success' : result.percentage >= 50 ? 'bg-warning' : 'bg-danger'}`}>
//                                 {parseFloat(result.percentage).toFixed(1)}%
//                               </span>
//                             </td>
//                             <td>{formatDate(result.submittedAt)}</td>
//                             <td><span className="badge bg-success">បានប្រឡង</span></td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default StudentDashboard;



import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import studentExamService from '../../services/studentExamService';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  console.log('TakeExam - Exam ID:', id);

  useEffect(() => {
    loadExam();
  }, [id]);

  const loadExam = async () => {
    try {
      setLoading(true);
      console.log('Loading exam...');
      const data = await studentExamService.getExamDetails(id);
      console.log('Exam loaded:', data);
      setExam(data);
      setTimeLeft(data.duration * 60);
      
      const initial = {};
      data.Questions?.forEach((_, idx) => { initial[idx] = ''; });
      setAnswers(initial);
    } catch (error) {
      console.error('Load exam error:', error);
      toast.error(error.response?.data?.message || 'មិនអាចផ្ទុកការប្រឡងបានទេ');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && exam) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && exam && !submitting) {
      handleSubmit();
    }
  }, [timeLeft, exam]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToQuestion = (index) => setCurrentIndex(index);
  const answeredCount = Object.values(answers).filter(a => a !== '').length;
  const total = exam?.Questions?.length || 0;
  const currentQ = exam?.Questions?.[currentIndex];

  const handleSubmit = async () => {
    if (submitting) return;
    if (!window.confirm('តើអ្នកប្រាកដជាចង់បញ្ជូនចម្លើយហើយមែនទេ?')) return;
    
    setSubmitting(true);
    try {
      const answerArray = Object.values(answers);
      console.log('Submitting answers:', answerArray);
      const result = await studentExamService.submitExam(id, answerArray);
      toast.success(`ប្រឡងបានបញ្ចប់! ពិន្ទុ: ${result.totalScore}/${result.totalPoints} (${result.percentage}%)`);
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'មានបញ្ហាក្នុងការបញ្ជូនចម្លើយ');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">កំពុងផ្ទុកការប្រឡង...</p>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="container py-4 fade-in">
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between">
            <h4 className="mb-0">{exam.title}</h4>
            <h3 className="mb-0">{formatTime(timeLeft)}</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6"><strong>មុខវិជ្ជា:</strong> {exam.subjectName}</div>
            <div className="col-md-6"><strong>វឌ្ឍនភាព:</strong> {answeredCount}/{total} សំណួរ</div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {exam.Questions?.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToQuestion(idx)}
                className={`btn ${currentIndex === idx ? 'btn-primary' : answers[idx] !== '' ? 'btn-success' : 'btn-outline-secondary'}`}
                style={{ width: '45px' }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between">
            <strong>សំណួរទី {currentIndex + 1} / {total}</strong>
            <span className="badge bg-info">{currentQ?.points} ពិន្ទុ</span>
          </div>
        </div>
        <div className="card-body">
          <p className="mb-4 fs-5">{currentQ?.questionText}</p>
          
          {['a', 'b', 'c', 'd'].map(opt => (
            <div className="form-check mb-3" key={opt}>
              <input
                className="form-check-input"
                type="radio"
                name="answer"
                id={`opt${opt}`}
                value={opt}
                checked={answers[currentIndex] === opt}
                onChange={() => setAnswers({ ...answers, [currentIndex]: opt })}
              />
              <label className="form-check-label" htmlFor={`opt${opt}`}>
                <strong>{opt.toUpperCase()}.</strong> {currentQ?.[`option_${opt}`]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mb-5">
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
        >
          ◀ សំណួរមុន
        </button>
        
        {currentIndex === total - 1 ? (
          <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'កំពុងផ្ញើ...' : 'បញ្ជូនចម្លើយ ✓'}
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={() => setCurrentIndex(prev => prev + 1)}>
            សំណួរបន្ទាប់ ▶
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeExam;