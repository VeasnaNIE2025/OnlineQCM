import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
  PointElement, LineElement
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  FaUsers, FaBook, FaQuestionCircle, FaChartLine,
  FaTrophy, FaCalendarAlt, FaSchool, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import reportService from '../../services/reportService';
import examService from '../../services/examService';
import subjectService from '../../services/subjectService';
import api from '../../services/api';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title,
  PointElement, LineElement
);

const toFixed = (val, digits = 1) => parseFloat(val || 0).toFixed(digits);

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('km-KH');
};

// ── Mini progress bar ──────────────────────────────────────────
const MiniBar = ({ value, total, color = 'success' }) => {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="progress flex-grow-1" style={{ height: 8 }}>
        <div className={`progress-bar bg-${color}`} style={{ width: `${pct}%` }} />
      </div>
      <small className="text-muted" style={{ minWidth: 30 }}>{value}</small>
    </div>
  );
};

const DashboardStats = () => {
  const [statistics, setStatistics]         = useState({});
  const [examAnalytics, setExamAnalytics]   = useState([]);
  const [topStudents, setTopStudents]        = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [subjects, setSubjects]             = useState([]);
  const [classStats, setClassStats]         = useState([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, examAnalyticsData, topStudentsData, activitiesData, subjectsData, classStatsData] =
        await Promise.all([
          reportService.getStatistics(),
          reportService.getExamAnalytics(),
          reportService.getTopStudents(5),
          reportService.getRecentActivities(),
          subjectService.getSubjects(),
          api.get('/admin/reports/class-statistics').then(r => r.data)
        ]);
      setStatistics(statsData);
      setExamAnalytics(examAnalyticsData);
      setTopStudents(topStudentsData);
      setRecentActivities(activitiesData);
      setSubjects(subjectsData);
      setClassStats(classStatsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPassed = examAnalytics.reduce((sum, e) => sum + (parseInt(e.passed) || 0), 0);
  const totalFailed = examAnalytics.reduce((sum, e) => sum + (parseInt(e.failed) || 0), 0);

  const pieData = useMemo(() => ({
    labels: ['ជាប់ (Pass)', 'ធ្លាក់ (Fail)'],
    datasets: [{
      data: [totalPassed, totalFailed],
      backgroundColor: ['#28a745', '#dc3545'],
      borderWidth: 0, hoverOffset: 10
    }]
  }), [totalPassed, totalFailed]);

  const topExams = useMemo(() =>
    [...examAnalytics]
      .sort((a, b) => parseFloat(b.averageScore || 0) - parseFloat(a.averageScore || 0))
      .slice(0, 5),
    [examAnalytics]
  );

  const barData = useMemo(() => ({
    labels: topExams.map(e => e.title?.substring(0, 15) + (e.title?.length > 15 ? '...' : '')),
    datasets: [{
      label: 'ពិន្ទុមធ្យម (%)',
      data: topExams.map(e => parseFloat(toFixed(e.averageScore))),
      backgroundColor: '#4F81BD',
      borderRadius: 8, barPercentage: 0.7, categoryPercentage: 0.8
    }]
  }), [topExams]);

  // Class bar chart — students per class
  const classBarData = useMemo(() => ({
    labels: classStats.map(c => c.className),
    datasets: [
      {
        label: 'សិស្សសរុប',
        data: classStats.map(c => c.totalStudents),
        backgroundColor: '#4F81BD',
        borderRadius: 6
      },
      {
        label: 'ជាប់',
        data: classStats.map(c => c.passed),
        backgroundColor: '#28a745',
        borderRadius: 6
      },
      {
        label: 'ធ្លាក់',
        data: classStats.map(c => c.failed),
        backgroundColor: '#dc3545',
        borderRadius: 6
      }
    ]
  }), [classStats]);

  const classBarOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 } } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.raw}%` } }
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
      x: { ticks: { font: { size: 11 } } }
    }
  };

  const monthlyChartData = useMemo(() => {
    const months = ['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
    const currentMonth = new Date().getMonth();
    const last6 = Array.from({ length: 6 }, (_, i) => months[(currentMonth - 5 + i + 12) % 12]);
    return {
      labels: last6,
      datasets: [{
        label: 'ចំនួនការប្រឡង',
        data: last6.map(() => Math.floor(Math.random() * 20) + 5),
        borderColor: '#4F81BD',
        backgroundColor: 'rgba(79, 129, 189, 0.1)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#4F81BD',
        pointBorderColor: '#fff',
        pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6
      }]
    };
  }, []);

  const subjectData = useMemo(() => ({
    labels: subjects.slice(0, 5).map(s => s.name),
    datasets: [{
      data: subjects.slice(0, 5).map(() => Math.floor(Math.random() * 50) + 10),
      backgroundColor: ['#4F81BD', '#9BBB59', '#F79646', '#8064A2', '#4BACC6'],
      borderWidth: 0, hoverOffset: 10
    }]
  }), [subjects]);

  const doughnutOptions = {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10 } } },
    cutout: '60%'
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="mt-2 text-muted">កំពុងផ្ទុកទិន្នន័យ...</p>
    </div>
  );

  const cards = [
    { title: 'សិស្សសរុប',   value: statistics.totalStudents  || 0, icon: <FaUsers />,         color: 'primary', change: '' },
    { title: 'ការប្រឡងសរុប', value: statistics.totalExams     || 0, icon: <FaBook />,          color: 'success', change: '' },
    { title: 'សំណួរសរុប',    value: statistics.totalQuestions || 0, icon: <FaQuestionCircle />,color: 'info',    change: '' },
    { title: 'ពិន្ទុមធ្យម',   value: `${toFixed(statistics.averageScore)}%`, icon: <FaChartLine />, color: 'warning', change: '' }
  ];

  const getCardStyle = (color) => ({
    primary: 'bg-gradient-primary', success: 'bg-gradient-success',
    info: 'bg-gradient-info', warning: 'bg-gradient-warning'
  })[color] || 'bg-primary';

  return (
    <div className="fade-in">

      {/* ── Summary Cards ── */}
      <div className="row g-4 mb-4">
        {cards.map((card, i) => (
          <div className="col-md-3" key={i}>
            <div className={`dashboard-card ${getCardStyle(card.color)} text-white`}>
              <div className="card-body p-4">
                <div className="card-icon">{card.icon}</div>
                <div className="card-title text-uppercase small fw-bold">{card.title}</div>
                <div className="card-value">{card.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold"><FaChartLine className="me-2 text-primary" />ការវិភាគលទ្ធផលប្រឡង</h6>
            </div>
            <div className="card-body text-center">
              <div style={{ maxWidth: 250, margin: '0 auto' }}>
                <Doughnut data={pieData} options={doughnutOptions} />
              </div>
              <div className="row mt-3">
                <div className="col-6">
                  <div className="p-2 bg-success bg-opacity-10 rounded">
                    <span className="text-success">✓ ជាប់</span>
                    <h4 className="mb-0 text-success">{totalPassed}</h4>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 bg-danger bg-opacity-10 rounded">
                    <span className="text-danger">✗ ធ្លាក់</span>
                    <h4 className="mb-0 text-danger">{totalFailed}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold"><FaTrophy className="me-2 text-warning" />ការប្រឡងកំពូលទាំង ៥</h6>
            </div>
            <div className="card-body">
              <Bar data={barData} options={barOptions} height={250} />
            </div>
          </div>
        </div>
      </div>

      {/* ── CLASS STATISTICS ── */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 pt-3">
          <h6 className="mb-0 fw-bold">
            <FaSchool className="me-2 text-primary" />ស្ថិតិតាមថ្នាក់
          </h6>
        </div>
        <div className="card-body">

          {/* Bar chart: students/passed/failed per class */}
          {classStats.length > 0 && (
            <div className="mb-4">
              <Bar data={classBarData} options={classBarOptions} height={120} />
            </div>
          )}

          {/* Table per class */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0">
              <thead className="table-primary">
                <tr>
                  <th>ថ្នាក់</th>
                  <th className="text-center">សិស្សសរុប</th>
                  <th>Course/មុខវិជ្ជា</th>
                  <th className="text-center">ប្រឡងបាន</th>
                  <th>ជាប់ / ធ្លាក់</th>
                  <th className="text-center">ពិន្ទុមធ្យម</th>
                  <th>ការប្រឡងខាងមុខ</th>
                </tr>
              </thead>
              <tbody>
                {classStats.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      មិនទាន់មានទិន្នន័យ — សូម assign ថ្នាក់ឱ្យសិស្ស
                    </td>
                  </tr>
                ) : classStats.map((cls) => (
                  <tr key={cls.classId}>
                    {/* ថ្នាក់ */}
                    <td>
                      <strong className="text-primary">{cls.className}</strong>
                    </td>

                    {/* សិស្សសរុប */}
                    <td className="text-center">
                      <span className="badge bg-primary fs-6">{cls.totalStudents}</span>
                    </td>

                    {/* Subjects */}
                    <td>
                      <small>{cls.subjects || '—'}</small>
                    </td>

                    {/* ចំនួនប្រឡង */}
                    <td className="text-center">
                      <span className="badge bg-secondary">{cls.studentsExamined}</span>
                    </td>

                    {/* ជាប់ / ធ្លាក់ bars */}
                    <td style={{ minWidth: 160 }}>
                      <div className="mb-1">
                        <small className="text-success fw-bold me-1">
                          <FaCheckCircle /> ជាប់: {cls.passed}
                        </small>
                        <MiniBar value={cls.passed} total={cls.studentsExamined} color="success" />
                      </div>
                      <div>
                        <small className="text-danger fw-bold me-1">
                          <FaTimesCircle /> ធ្លាក់: {cls.failed}
                        </small>
                        <MiniBar value={cls.failed} total={cls.studentsExamined} color="danger" />
                      </div>
                    </td>

                    {/* ពិន្ទុមធ្យម */}
                    <td className="text-center">
                      {cls.studentsExamined > 0 ? (
                        <span className={`badge fs-6 bg-${
                          parseFloat(cls.avgScore) >= 70 ? 'success'
                          : parseFloat(cls.avgScore) >= 50 ? 'warning text-dark'
                          : 'danger'
                        }`}>
                          {toFixed(cls.avgScore)}%
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>

                    {/* ការប្រឡងខាងមុខ */}
                    <td>
                      {cls.upcomingExams && cls.upcomingExams.length > 0 ? (
                        <ul className="list-unstyled mb-0">
                          {cls.upcomingExams.slice(0, 3).map((ex, i) => (
                            <li key={i} className="mb-1">
                              <small>
                                <span className="badge bg-light text-dark border me-1">{ex.subjectName}</span>
                                {ex.title}
                                <br />
                                <FaCalendarAlt className="me-1 text-muted" />
                                <span className="text-muted">{formatDate(ex.startDate)}</span>
                              </small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <small className="text-muted">គ្មានការប្រឡង</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold"><FaCalendarAlt className="me-2 text-info" />សកម្មភាពប្រចាំខែ</h6>
            </div>
            <div className="card-body">
              <Line data={monthlyChartData}
                options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
                height={250} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold"><FaBook className="me-2 text-success" />ស្ថិតិតាមមុខវិជ្ជា</h6>
            </div>
            <div className="card-body">
              <Pie data={subjectData}
                options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }}
                height={250} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Students & Recent Activities ── */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold"><FaTrophy className="me-2 text-warning" />សិស្សពូកែប្រចាំខែ</h6>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr><th>#</th><th>ឈ្មោះ</th><th>ពិន្ទុមធ្យម</th><th>កម្រិត</th></tr>
                </thead>
                <tbody>
                  {topStudents.map((s, i) => {
                    const score = parseFloat(s.averageScore || 0);
                    return (
                      <tr key={i}>
                        <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                        <td><strong>{s.fullName}</strong></td>
                        <td>{toFixed(s.averageScore)}%</td>
                        <td>
                          <span className={`badge ${score >= 80 ? 'bg-success' : score >= 60 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {score >= 80 ? 'ពូកែ' : score >= 60 ? 'ល្អ' : 'ត្រូវការកែលម្អ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {topStudents.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-4 text-muted">មិនទាន់មានទិន្នន័យ</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold"><FaCalendarAlt className="me-2 text-info" />សកម្មភាពថ្មីៗ</h6>
            </div>
            <div className="card-body p-0">
              {recentActivities.slice(0, 5).map((a, i) => (
                <div key={i} className="p-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="fw-bold">
                        {a.type === 'exam_completed' ? '📝 បានប្រឡងរួចរាល់' : '➕ បានបង្កើតការប្រឡងថ្មី'}
                      </div>
                      <small className="text-muted">
                        {a.type === 'exam_completed'
                          ? `${a.studentName || 'សិស្ស'} — ${a.examTitle || ''}`
                          : a.examTitle || ''}
                      </small>
                      {a.percentage && (
                        <div className="mt-1">
                          <div className="progress" style={{ height: 4 }}>
                            <div className={`progress-bar ${parseFloat(a.percentage) >= 70 ? 'bg-success' : parseFloat(a.percentage) >= 50 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${parseFloat(a.percentage)}%` }} />
                          </div>
                          <small className={parseFloat(a.percentage) >= 70 ? 'text-success' : parseFloat(a.percentage) >= 50 ? 'text-warning' : 'text-danger'}>
                            {toFixed(a.percentage)}%
                          </small>
                        </div>
                      )}
                    </div>
                    <small className="text-muted ms-2">{formatDate(a.createdAt)}</small>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="p-4 text-center text-muted">មិនមានសកម្មភាព</div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardStats;