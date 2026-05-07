import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student',
    classId: ''
  });

  const [errors, setErrors] = useState({});
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await api.get('/classes');
        setClasses(res.data);
      } catch (err) {
        console.error('Failed to load classes', err);
        toast.error('មិនអាចផ្ទុកបញ្ជីថ្នាក់បានទេ');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'ឈ្មោះពេញត្រូវតែមានយ៉ាងតិច ៣ តួអក្សរ';
    }

    if (!formData.username.trim() || formData.username.trim().length < 4) {
      newErrors.username = 'ឈ្មោះអ្នកប្រើត្រូវតែមានយ៉ាងតិច ៤ តួអក្សរ';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ';
    }

    if (!formData.classId) {
      newErrors.classId = 'សូមជ្រើសរើសថ្នាក់រៀន';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងតិច ៦ តួអក្សរ';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'ពាក្យសម្ងាត់មិនត្រូវគ្នា';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('សូមពិនិត្យព័ត៌មានដែលបានបញ្ចូលឡើងវិញ');
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
      <div className="card shadow-lg border-0" style={{ width: '460px', borderRadius: '15px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="display-4">📋</div>
            <h2 className="mt-2">បង្កើតគណនីថ្មី</h2>
            <p className="text-muted">ចុះឈ្មោះជាសិស្សថ្មីនៃប្រព័ន្ធប្រឡង QCM</p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="mb-3">
              <label className="form-label">ឈ្មោះពេញ</label>
              <input
                type="text"
                className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                name="fullName"
                placeholder="បញ្ចូលឈ្មោះពេញរបស់អ្នក"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">ឈ្មោះអ្នកប្រើប្រាស់</label>
              <input
                type="text"
                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                name="username"
                placeholder="ជ្រើសរើសឈ្មោះអ្នកប្រើ"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">អ៊ីមែល</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                name="email"
                placeholder="បញ្ចូលអ៊ីមែលរបស់អ្នក"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">ថ្នាក់រៀន</label>
              <select
                className={`form-control ${errors.classId ? 'is-invalid' : ''}`}
                name="classId"
                value={formData.classId}
                onChange={handleChange}
                required
                disabled={loadingClasses}
              >
                <option value="">-- ជ្រើសរើសថ្នាក់ --</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              {errors.classId && <div className="invalid-feedback">{errors.classId}</div>}
              {loadingClasses && <small className="text-muted">កំពុងផ្ទុកថ្នាក់...</small>}
            </div>

            <div className="mb-3">
              <label className="form-label">ពាក្យសម្ងាត់</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                name="password"
                placeholder="បង្កើតពាក្យសម្ងាត់ (យ៉ាងតិច ៦ តួ)"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">បញ្ជាក់ពាក្យសម្ងាត់</label>
              <input
                type="password"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                name="confirmPassword"
                placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  កំពុងចុះឈ្មោះ...
                </>
              ) : (
                'ចុះឈ្មោះ'
              )}
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