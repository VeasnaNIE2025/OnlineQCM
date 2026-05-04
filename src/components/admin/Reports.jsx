import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaBook, FaQuestionCircle, FaTrophy, FaClock, FaFileExcel } from 'react-icons/fa';
import toast from 'react-hot-toast';
import reportService from '../../services/reportService';
import examService from '../../services/examService';
import exportService from '../../services/exportService';

// ✅ Helper: safely convert any value to float then toFixed
const toFixed = (val, digits = 1) => parseFloat(val || 0).toFixed(digits);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statistics, setStatistics] = useState({});
  const [examResults, setExamResults] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [examAnalytics, setExamAnalytics] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');

  useEffect(() => { loadAllData(); }, []);

  useEffect(() => {
    if (selectedExam) {
      loadExamResults(selectedExam);
    } else {
      loadExamResults();
    }
  }, [selectedExam]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        studentPerfData,
        subjectPerfData,
        examAnalyticsData,
        topStudentsData,
        activitiesData,
        examsData
      ] = await Promise.all([
        reportService.getStatistics(),
        reportService.getStudentPerformance(),
        reportService.getSubjectPerformance(),
        reportService.getExamAnalytics(),
        reportService.getTopStudents(10),
        reportService.getRecentActivities(),
        examService.getExams()
      ]);
      setStatistics(statsData);
      setStudentPerformance(studentPerfData);
      setSubjectPerformance(subjectPerfData);
      setExamAnalytics(examAnalyticsData);
      setTopStudents(topStudentsData);
      setRecentActivities(activitiesData);
      setExams(examsData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('មិនអាចផ្ទុកទិន្នន័យរបាយការណ៍បានទេ');
    } finally {
      setLoading(false);
    }
  };

  const loadExamResults = async (examId = null) => {
    try {
      const data = await reportService.getExamResultsReport(examId);
      setExamResults(data);
    } catch (error) {
      console.error('Error loading exam results:', error);
    }
  };

  const getScoreColor = (val) => {
    const v = parseFloat(val || 0);
    if (v >= 70) return 'success';
    if (v >= 50) return 'warning';
    return 'danger';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('km-KH');
  };

  const handleExportExamResults = async () => {
    try {
      toast.loading('កំពុងទាញយក...', { id: 'export' });
      const data = await exportService.exportExamResults(selectedExam || null);
      const filename = selectedExam
        ? `លទ្ធផលប្រឡង_${exams.find(e => e.id == selectedExam)?.title}_${Date.now()}.xlsx`
        : `លទ្ធផលប្រឡងទាំងអស់_${Date.now()}.xlsx`;
      exportService.downloadFile(data, filename);
      toast.success('ទាញយកបានជោគជ័យ!', { id: 'export' });
    } catch (error) {
      toast.error('មិនអាចទាញយកឯកសារបានទេ', { id: 'export' });
    }
  };

  const handleExportStudentPerformance = async () => {
    try {
      toast.loading('កំពុងទាញយក...', { id: 'export' });
      const data = await exportService.exportStudentPerformance();
      exportService.downloadFile(data, `ដំណើរការសិស្ស_${Date.now()}.xlsx`);
      toast.success('ទាញយកបានជោគជ័យ!', { id: 'export' });
    } catch (error) {
      toast.error('មិនអាចទាញយកឯកសារបានទេ', { id: 'export' });
    }
  };

  const handleExportSubjectPerformance = async () => {
    try {
      toast.loading('កំពុងទាញយក...', { id: 'export' });
      const data = await exportService.exportSubjectPerformance();
      exportService.downloadFile(data, `ដំណើរការមុខវិជ្ជា_${Date.now()}.xlsx`);
      toast.success('ទាញយកបានជោគជ័យ!', { id: 'export' });
    } catch (error) {
      toast.error('មិនអាចទាញយកឯកសារបានទេ', { id: 'export' });
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
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <FaChartLine className="me-2" />ផ្ទាំងរបាយការណ៍
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'exam-results' ? 'active' : ''}`} onClick={() => setActiveTab('exam-results')}>
            <FaBook className="me-2" />លទ្ធផលប្រឡង
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'student-performance' ? 'active' : ''}`} onClick={() => setActiveTab('student-performance')}>
            <FaUsers className="me-2" />ដំណើរការសិស្ស
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'subject-performance' ? 'active' : ''}`} onClick={() => setActiveTab('subject-performance')}>
            <FaBook className="me-2" />ដំណើរការមុខវិជ្ជា
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'top-students' ? 'active' : ''}`} onClick={() => setActiveTab('top-students')}>
            <FaTrophy className="me-2" />សិស្សពូកែ
          </button>
        </li>
      </ul>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <div className="row mb-4">
            {[
              { label: 'សិស្សសរុប', val: statistics.totalStudents, icon: <FaUsers size={30} />, color: 'primary' },
              { label: 'គ្រូបង្រៀនសរុប', val: statistics.totalTeachers, icon: <FaUsers size={30} />, color: 'success' },
              { label: 'មុខវិជ្ជា', val: statistics.totalSubjects, icon: <FaBook size={30} />, color: 'info' },
              { label: 'សំណួរសរុប', val: statistics.totalQuestions, icon: <FaQuestionCircle size={30} />, color: 'warning' },
            ].map((c, i) => (
              <div className="col-md-3 mb-3" key={i}>
                <div className={`card bg-${c.color} text-white`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div><h6>{c.label}</h6><h2 className="mb-0">{c.val || 0}</h2></div>
                      {c.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h6 className="mb-0"><FaChartLine className="me-2" />ស្ថិតិប្រឡង</h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label>ការប្រឡងសរុប: <strong>{statistics.totalExams || 0}</strong></label>
                  </div>
                  <div className="mb-3">
                    <label>ការប្រឡងបានប្រឡងរួច: <strong>{statistics.totalCompletedExams || 0}</strong></label>
                  </div>
                  <div className="mb-3">
                    {/* ✅ Fix */}
                    <label>ពិន្ទុមធ្យម: <strong>{toFixed(statistics.averageScore)}%</strong></label>
                    <div className="progress">
                      <div className="progress-bar bg-success" style={{ width: `${parseFloat(statistics.averageScore || 0)}%` }}>
                        {toFixed(statistics.averageScore)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h6 className="mb-0"><FaClock className="me-2" />សកម្មភាពថ្មីៗ</h6>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {recentActivities.slice(0, 5).map((activity, idx) => (
                      <div key={idx} className="list-group-item">
                        <small className="text-muted">{formatDate(activity.createdAt)}</small>
                        <div>
                          {activity.type === 'exam_completed' ? (
                            // ✅ Fix: toFixed helper
                            <>📝 {activity.studentName} បានប្រឡង {activity.examTitle} បាន {toFixed(activity.percentage)}%</>
                          ) : (
                            <>➕ បានបង្កើតការប្រឡង {activity.examTitle}</>
                          )}
                        </div>
                      </div>
                    ))}
                    {recentActivities.length === 0 && (
                      <div className="list-group-item text-center">មិនមានសកម្មភាព</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Analytics Table */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0"><FaChartLine className="me-2" />ការវិភាគការប្រឡង</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>ការប្រឡង</th>
                      <th>ចំនួនដង</th>
                      <th>ជាប់</th>
                      <th>មធ្យម</th>
                      <th>ធ្លាក់</th>
                      <th>ពិន្ទុមធ្យម</th>
                      <th>ខ្ពស់បំផុត</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examAnalytics.map((exam, idx) => (
                      <tr key={idx}>
                        <td>{exam.title}</td>
                        <td>{exam.totalAttempts || 0}</td>
                        <td className="text-success">{exam.passed || 0}</td>
                        <td className="text-warning">{exam.average || 0}</td>
                        <td className="text-danger">{exam.failed || 0}</td>
                        {/* ✅ Fix */}
                        <td>{toFixed(exam.averageScore)}%</td>
                        <td>{toFixed(exam.highestScore)}%</td>
                      </tr>
                    ))}
                    {examAnalytics.length === 0 && (
                      <tr><td colSpan="7" className="text-center py-4 text-muted">មិនទាន់មានទិន្នន័យ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Exam Results Tab */}
      {activeTab === 'exam-results' && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0"><FaBook className="me-2" />លទ្ធផលប្រឡង</h6>
              <button className="btn btn-success btn-sm" onClick={handleExportExamResults}>
                <FaFileExcel className="me-1" />ទាញយក Excel
              </button>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <select className="form-select form-select-sm" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                  <option value="">ទាំងអស់</option>
                  {exams.map(exam => <option key={exam.id} value={exam.id}>{exam.title}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>សិស្ស</th><th>អ៊ីមែល</th><th>ការប្រឡង</th>
                    <th>ពិន្ទុ</th><th>ភាគរយ</th><th>ថ្ងៃប្រឡង</th>
                  </tr>
                </thead>
                <tbody>
                  {examResults.map((result, idx) => (
                    <tr key={idx}>
                      <td>{result.studentName}</td>
                      <td>{result.studentEmail}</td>
                      <td>{result.examTitle}</td>
                      <td>{result.totalScore} / {result.totalPoints}</td>
                      <td>
                        {/* ✅ Fix */}
                        <span className={`badge bg-${getScoreColor(result.percentage)}`}>
                          {toFixed(result.percentage)}%
                        </span>
                      </td>
                      <td>{formatDate(result.submittedAt)}</td>
                    </tr>
                  ))}
                  {examResults.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">មិនទាន់មានទិន្នន័យ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Student Performance Tab */}
      {activeTab === 'student-performance' && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0"><FaUsers className="me-2" />ដំណើរការសិស្ស</h6>
              <button className="btn btn-success btn-sm" onClick={handleExportStudentPerformance}>
                <FaFileExcel className="me-1" />ទាញយក Excel
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>សិស្ស</th><th>អ៊ីមែល</th><th>ប្រឡងបាន</th>
                    <th>ពិន្ទុសរុប</th><th>ពិន្ទុសរុបដែលអាចបាន</th><th>មធ្យម</th>
                  </tr>
                </thead>
                <tbody>
                  {studentPerformance.map((student, idx) => (
                    <tr key={idx}>
                      <td>{student.fullName}</td>
                      <td>{student.email}</td>
                      <td>{student.totalExamsTaken || 0}</td>
                      <td>{student.totalScore || 0}</td>
                      <td>{student.totalPossible || 0}</td>
                      <td>
                        {/* ✅ Fix */}
                        <span className={`badge bg-${getScoreColor(student.averagePercentage)}`}>
                          {toFixed(student.averagePercentage)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {studentPerformance.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">មិនទាន់មានទិន្នន័យ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subject Performance Tab */}
      {activeTab === 'subject-performance' && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0"><FaBook className="me-2" />ដំណើរការមុខវិជ្ជា</h6>
              <button className="btn btn-success btn-sm" onClick={handleExportSubjectPerformance}>
                <FaFileExcel className="me-1" />ទាញយក Excel
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>មុខវិជ្ជា</th><th>ការប្រឡង</th><th>សិស្សចូលរួម</th><th>ពិន្ទុមធ្យម</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectPerformance.map((subject, idx) => (
                    <tr key={idx}>
                      <td>{subject.subjectName}</td>
                      <td>{subject.totalExams || 0}</td>
                      <td>{subject.totalStudents || 0}</td>
                      <td>
                        {/* ✅ Fix */}
                        <span className={`badge bg-${getScoreColor(subject.averageScore)}`}>
                          {toFixed(subject.averageScore)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {subjectPerformance.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-4 text-muted">មិនទាន់មានទិន្នន័យ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Top Students Tab */}
      {activeTab === 'top-students' && (
        <div className="card shadow-sm">
          <div className="card-header bg-white">
            <h6 className="mb-0"><FaTrophy className="me-2 text-warning" />សិស្សពូកែប្រចាំប្រព័ន្ធ</h6>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th><th>សិស្ស</th><th>អ៊ីមែល</th>
                    <th>ចំនួនប្រឡង</th><th>ពិន្ទុមធ្យម</th><th>ពិន្ទុខ្ពស់បំផុត</th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, idx) => (
                    <tr key={idx}>
                      <td>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</td>
                      <td><strong>{student.fullName}</strong></td>
                      <td>{student.email}</td>
                      <td>{student.examsTaken || 0}</td>
                      <td>
                        {/* ✅ Fix */}
                        <span className={`badge bg-${getScoreColor(student.averageScore)}`}>
                          {toFixed(student.averageScore)}%
                        </span>
                      </td>
                      {/* ✅ Fix */}
                      <td>{toFixed(student.bestScore)}%</td>
                    </tr>
                  ))}
                  {topStudents.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">មិនទាន់មានទិន្នន័យ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;