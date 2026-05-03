import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardStats from '../../components/admin/DashboardStats';
import UserManagement from '../../components/admin/UserManagement';
import SubjectManagement from '../../components/admin/SubjectManagement';
import QuestionManagement from '../../components/admin/QuestionManagement';
import ExamManagement from '../../components/admin/ExamManagement';  // <-- Check this import
import Reports from '../../components/admin/Reports';
import { FaUsers, FaBook, FaQuestionCircle, FaChartLine, FaSignOutAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'ផ្ទាំងគ្រប់គ្រង', icon: '📊' },
    { id: 'users', label: 'គ្រប់គ្រងអ្នកប្រើប្រាស់', icon: '👥' },
    { id: 'subjects', label: 'គ្រប់គ្រងមុខវិជ្ជា', icon: '📚' },
    { id: 'questions', label: 'គ្រប់គ្រងសំណួរ', icon: '❓' },
    { id: 'exams', label: 'គ្រប់គ្រងការប្រឡង', icon: '📝' },
    { id: 'reports', label: 'របាយការណ៍', icon: '📈' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('ចាកចេញពីប្រព័ន្ធដោយជោគជ័យ');
    navigate('/login');
  };

  const renderContent = () => {
    switch(activeMenu) {
      case 'users':
        return <UserManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'questions':
        return <QuestionManagement />;
      case 'exams':
        return <ExamManagement />;
      case 'reports':
        return <Reports />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-2 d-md-block sidebar vh-100 p-0">
          <div className="position-sticky pt-3">
            <div className="text-center text-white mb-4">
              <h4 className="py-3">📝 QCM System</h4>
              <hr className="bg-light mx-3" />
            </div>
            <ul className="nav flex-column">
              {menuItems.map(item => (
                <li className="nav-item" key={item.id}>
                  <button
                    className={`nav-link text-white w-100 text-start ${activeMenu === item.id ? 'active bg-white bg-opacity-25' : ''}`}
                    onClick={() => setActiveMenu(item.id)}
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    {item.icon} {item.label}
                  </button>
                </li>
              ))}
              <li className="nav-item mt-5">
                <button
                  onClick={handleLogout}
                  className="nav-link text-white w-100 text-start"
                  style={{ border: 'none', background: 'transparent' }}
                >
                  <FaSignOutAlt className="me-2" /> ចាកចេញ
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="col-md-10 ms-sm-auto px-md-4 py-3">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h2">
              {menuItems.find(m => m.id === activeMenu)?.label || 'ផ្ទាំងគ្រប់គ្រង'}
            </h1>
            <div>
              <span className="text-muted">ស្វាគមន៍, </span>
              <strong>{user?.fullName}</strong>
              <span className="badge bg-secondary ms-2">{user?.role}</span>
            </div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;