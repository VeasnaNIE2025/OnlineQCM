import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('ពាក្យសម្ងាត់មិនត្រូវគ្នា');
      return;
    }
    
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      toast.success('ចុះឈ្មោះបានជោគជ័យ! សូមចូលប្រព័ន្ធ');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការចុះឈ្មោះ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light fade-in">
      <div className="card shadow-lg border-0" style={{ width: '480px', borderRadius: '15px' }}>
        <div className="card-body p-5">
          <h2 className="text-center mb-4">បង្កើតគណនីថ្មី</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">ឈ្មោះពេញ</label>
              <input
                type="text"
                className="form-control"
                name="fullName"
                placeholder="បញ្ចូលឈ្មោះពេញរបស់អ្នក"
                value={formData.fullName}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">ឈ្មោះអ្នកប្រើប្រាស់</label>
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="ជ្រើសរើសឈ្មោះអ្នកប្រើប្រាស់"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">អ៊ីមែល</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">ពាក្យសម្ងាត់</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="បង្កើតពាក្យសម្ងាត់"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">បញ្ជាក់ពាក្យសម្ងាត់</label>
              <input
                type="password"
                className="form-control"
                name="confirmPassword"
                placeholder="បញ្ជាក់ពាក្យសម្ងាត់របស់អ្នក"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100" 
              disabled={loading}
            >
              {loading ? 'កំពុងចុះឈ្មោះ...' : 'ចុះឈ្មោះ'}
            </button>
          </form>
          <p className="text-center mt-3">
            មានគណនីរួចហើយ? <Link to="/login">ចូលប្រព័ន្ធ</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;