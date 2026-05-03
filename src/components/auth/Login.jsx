import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  // Clear any existing session when landing on login page
  useEffect(() => {
    // Force clear any leftover session
    logout();
    setEmail('');
    setPassword('');
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      console.log('Login page - User already logged in:', user.role);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('សូមបញ្ចូលអ៊ីមែល និងពាក្យសម្ងាត់');
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = await login(email, password);
      console.log('Login successful:', userData.role);
      toast.success('ចូលប្រព័ន្ធដោយជោគជ័យ!');
      
      // Navigate based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'អ៊ីមែល ឬ ពាក្យសម្ងាត់មិនត្រឹមត្រូវ');
      // Clear form on error
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light fade-in">
      <div className="card shadow-lg border-0" style={{ width: '420px', borderRadius: '15px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="display-4">📝</div>
            <h2 className="mt-2">ប្រព័ន្ធប្រឡង QCM</h2>
            <p className="text-muted">សូមបំពេញព័ត៌មានចូលប្រព័ន្ធ</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">អ៊ីមែល</label>
              <input
                type="email"
                className="form-control"
                placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">ពាក្យសម្ងាត់</label>
              <input
                type="password"
                className="form-control"
                placeholder="បញ្ចូលពាក្យសម្ងាត់"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2" 
              disabled={loading}
            >
              {loading ? 'កំពុងភ្ជាប់...' : 'ចូលប្រព័ន្ធ'}
            </button>
          </form>
          
          <p className="text-center mt-3">
            មិនទាន់មានគណនី? <Link to="/register">ចុះឈ្មោះនៅទីនេះ</Link>
          </p>
          <hr />
          <p className="text-center text-muted small mb-0">
            {/* 📧 admin@qcm.com / admin123<br />
            📧 student@test.com / 123456 */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;