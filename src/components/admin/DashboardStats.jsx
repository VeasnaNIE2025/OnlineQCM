import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  FaUsers, 
  FaBook, 
  FaQuestionCircle, 
  FaChartLine, 
  FaTrophy, 
  FaCalendarAlt, 
  FaUserGraduate  // ប្រើ FaUserGraduate ជំនួស UserGraduate
} from 'react-icons/fa';
import reportService from '../../services/reportService';
import examService from '../../services/examService';
import subjectService from '../../services/subjectService';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

const DashboardStats = () => {
  const [statistics, setStatistics] = useState({});
  const [examAnalytics, setExamAnalytics] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsData,
        examAnalyticsData,
        topStudentsData,
        activitiesData,
        examsData,
        subjectsData
      ] = await Promise.all([
        reportService.getStatistics(),
        reportService.getExamAnalytics(),
        reportService.getTopStudents(5),
        reportService.getRecentActivities(),
        examService.getExams(),
        subjectService.getSubjects()
      ]);
      
      setStatistics(statsData);
      setExamAnalytics(examAnalyticsData);
      setTopStudents(topStudentsData);
      setRecentActivities(activitiesData);
      setExams(examsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pie chart - Exam pass/fail distribution
  const totalExams = examAnalytics.reduce((sum, e) => sum + (e.totalAttempts || 0), 0);
  const totalPassed = examAnalytics.reduce((sum, e) => sum + (e.passed || 0), 0);
  const totalFailed = examAnalytics.reduce((sum, e) => sum + (e.failed || 0), 0);

  const pieData = {
    labels: ['ជាប់ (Pass)', 'ធ្លាក់ (Fail)'],
    datasets: [{
      data: [totalPassed, totalFailed],
      backgroundColor: ['#28a745', '#dc3545'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  // Bar chart - Top 5 exam performance
  const topExams = [...examAnalytics].sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0)).slice(0, 5);
  
  const barData = {
    labels: topExams.map(e => e.title?.substring(0, 15) + (e.title?.length > 15 ? '...' : '')),
    datasets: [{
      label: 'ពិន្ទុមធ្យម (%)',
      data: topExams.map(e => e.averageScore?.toFixed(1) || 0),
      backgroundColor: '#4F81BD',
      borderRadius: 8,
      barPercentage: 0.7,
      categoryPercentage: 0.8
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: { font: { size: 12 } }
      },
      tooltip: { 
        callbacks: { 
          label: (ctx) => `${ctx.raw}%` 
        }
      }
    },
    scales: { 
      y: { 
        beginAtZero: true, 
        max: 100, 
        title: { 
          display: true, 
          text: 'ភាគរយ (%)',
          font: { size: 12 }
        } 
      },
      x: {
        ticks: { font: { size: 11 } }
      }
    }
  };

  // Line chart - Monthly activity
  const monthlyData = () => {
    const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      last6Months.push(months[(currentMonth - i + 12) % 12]);
    }
    
    const examCount = last6Months.map(() => Math.floor(Math.random() * 20) + 5);
    
    return {
      labels: last6Months,
      datasets: [{
        label: 'ចំនួនការប្រឡង',
        data: examCount,
        borderColor: '#4F81BD',
        backgroundColor: 'rgba(79, 129, 189, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4F81BD',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    };
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { 
      legend: { 
        position: 'top',
        labels: { font: { size: 12 } }
      } 
    }
  };

  // Doughnut chart - Subject distribution
  const subjectData = {
    labels: subjects.slice(0, 5).map(s => s.name),
    datasets: [{
      data: subjects.slice(0, 5).map(() => Math.floor(Math.random() * 50) + 10),
      backgroundColor: ['#4F81BD', '#9BBB59', '#F79646', '#8064A2', '#4BACC6'],
      borderWidth: 0,
      hoverOffset: 10
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11 }, boxWidth: 10 }
      }
    },
    cutout: '60%'
  };

  const formatDate = (date) => new Date(date).toLocaleString('km-KH');

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

  const cards = [
    { 
      title: 'សិស្សសរុប', 
      value: statistics.totalStudents || 0, 
      icon: <FaUsers />, 
      subtitle: 'ចំនួនសិស្សក្នុងប្រព័ន្ធ',
      color: 'primary',
      change: '+12%',
      changeType: 'increase'
    },
    { 
      title: 'ការប្រឡងសរុប', 
      value: statistics.totalExams || 0, 
      icon: <FaBook />, 
      subtitle: 'ចំនួនការប្រឡងដែលបានបង្កើត',
      color: 'success',
      change: '+5%',
      changeType: 'increase'
    },
    { 
      title: 'សំណួរសរុប', 
      value: statistics.totalQuestions || 0, 
      icon: <FaQuestionCircle />, 
      subtitle: 'ចំនួនសំណួរក្នុងប្រព័ន្ធ',
      color: 'info',
      change: '+8%',
      changeType: 'increase'
    },
    { 
      title: 'ពិន្ទុមធ្យម', 
      value: `${statistics.averageScore || 0}%`, 
      icon: <FaChartLine />, 
      subtitle: 'ពិន្ទុមធ្យមរបស់សិស្សទាំងអស់',
      color: 'warning',
      change: '-3%',
      changeType: 'decrease'
    }
  ];

  const getCardStyle = (color) => {
    const styles = {
      primary: 'bg-gradient-primary',
      success: 'bg-gradient-success',
      info: 'bg-gradient-info',
      warning: 'bg-gradient-warning'
    };
    return styles[color] || 'bg-primary';
  };

  return (
    <div className="fade-in">
      {/* Statistics Cards */}
      <div className="row g-4 mb-4">
        {cards.map((card, index) => (
          <div className="col-md-3" key={index}>
            <div className={`dashboard-card ${getCardStyle(card.color)} text-white`}>
              <div className="card-body p-4">
                <div className="card-icon">{card.icon}</div>
                <div className="card-title text-uppercase small fw-bold">
                  {card.title}
                </div>
                <div className="card-value">{card.value}</div>
                <div className="card-subtitle">{card.subtitle}</div>
                <div className="mt-2">
                  <small className={`text-${card.changeType === 'increase' ? 'light' : 'light'}`}>
                    {card.change === '-3%' ? '↓' : '↑'} {card.change}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold">
                <FaChartLine className="me-2 text-primary" />
                ការវិភាគលទ្ធផលប្រឡង
              </h6>
            </div>
            <div className="card-body text-center">
              <div className="chart-container" style={{ maxWidth: '250px', margin: '0 auto' }}>
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
              <h6 className="mb-0 fw-bold">
                <FaTrophy className="me-2 text-warning" />
                ការប្រឡងកំពូលទាំង ៥
              </h6>
            </div>
            <div className="card-body">
              <Bar data={barData} options={barOptions} height={250} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold">
                <FaCalendarAlt className="me-2 text-info" />
                សកម្មភាពប្រចាំខែ
              </h6>
            </div>
            <div className="card-body">
              <Line data={monthlyData()} options={lineOptions} height={250} />
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold">
                <FaBook className="me-2 text-success" />
                ស្ថិតិតាមមុខវិជ្ជា
              </h6>
            </div>
            <div className="card-body">
              <Pie data={subjectData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }} height={250} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Students & Recent Activities */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold">
                <FaTrophy className="me-2 text-warning" />
                សិស្សពូកែប្រចាំខែ
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>ឈ្មោះ</th>
                      <th>ពិន្ទុមធ្យម</th>
                      <th>កម្រិត</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((student, idx) => (
                      <tr key={idx}>
                        <td className="text-center">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                        </td>
                        <td><strong>{student.fullName}</strong></td>
                        <td>{student.averageScore?.toFixed(1)}%</td>
                        <td>
                          <span className={`badge ${student.averageScore >= 80 ? 'bg-success' : student.averageScore >= 60 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {student.averageScore >= 80 ? 'ពូកែ' : student.averageScore >= 60 ? 'ល្អ' : 'ត្រូវការកែលម្អ'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {topStudents.length === 0 && (
                      <tr><td colSpan="4" className="text-center py-4 text-muted">មិនទាន់មានទិន្នន័យ</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3">
              <h6 className="mb-0 fw-bold">
                <FaCalendarAlt className="me-2 text-info" />
                សកម្មភាពថ្មីៗ
              </h6>
            </div>
            <div className="card-body p-0">
              <div className="activity-list">
                {recentActivities.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="activity-item p-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <div className="fw-bold">
                          {activity.type === 'exam_completed' ? '📝 បានប្រឡងរួចរាល់' : '➕ បានបង្កើតការប្រឡងថ្មី'}
                        </div>
                        <small className="text-muted d-block">
                          {activity.type === 'exam_completed' 
                            ? `${activity.studentName || 'សិស្ស'} - ${activity.examTitle || 'ការប្រឡង'}`
                            : `${activity.examTitle || 'ការប្រឡង'}`
                          }
                        </small>
                        {activity.percentage && (
                          <div className="mt-1">
                            <div className="progress" style={{ height: '4px' }}>
                              <div className={`progress-bar ${activity.percentage >= 70 ? 'bg-success' : activity.percentage >= 50 ? 'bg-warning' : 'bg-danger'}`} 
                                   style={{ width: `${activity.percentage}%` }}></div>
                            </div>
                            <small className={`${activity.percentage >= 70 ? 'text-success' : activity.percentage >= 50 ? 'text-warning' : 'text-danger'}`}>
                              {activity.percentage?.toFixed(1)}%
                            </small>
                          </div>
                        )}
                      </div>
                      <small className="text-muted ms-3">{formatDate(activity.createdAt)}</small>
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
    </div>
  );
};

export default DashboardStats;