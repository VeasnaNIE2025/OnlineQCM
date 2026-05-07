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

        toast.error('មិនអាចផ្ទុកបញ្ជីថ្នាក់បានទេ');

      } finally {

        setLoadingClasses(false);

      }

    };

    fetchClasses();

  }, []);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {

      toast.error('ពាក្យសម្ងាត់មិនត្រូវគ្នា');
      return;

    }

    if (!formData.classId) {

      toast.error('សូមជ្រើសរើសថ្នាក់រៀន');
      return;

    }

    setLoading(true);

    try {

      const { confirmPassword, ...userData } = formData;

      await register(userData);

      toast.success('ចុះឈ្មោះបានជោគជ័យ!');

      navigate('/login');

    } catch (error) {

      toast.error(
        error.response?.data?.message || 'បរាជ័យក្នុងការចុះឈ្មោះ'
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3"
      style={{ fontFamily: 'Kantumruy Pro, sans-serif' }}
    >

      <div
        className="card border-0 shadow-lg rounded-4 p-4 w-100"
        style={{ maxWidth: '430px' }}
      >

        {/* Header */}
        <div className="text-center mb-4">

          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-4 text-white"
            style={{
              width: '70px',
              height: '70px',
              background: '#0a4a38',
              fontSize: '30px'
            }}
          >
            📋
          </div>

          <h2 className="fw-bold mb-2">
            បង្កើតគណនីថ្មី
          </h2>

          <p className="text-muted small mb-0">
            ចុះឈ្មោះជាសិស្សថ្មីនៃប្រព័ន្ធ
          </p>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off">

          <div className="mb-3">

            <label className="form-label">
              ឈ្មោះពេញ
            </label>

            <input
              type="text"
              className="form-control rounded-3"
              name="fullName"
              placeholder="បញ្ចូលឈ្មោះពេញ"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-3">

            <label className="form-label">
              ឈ្មោះអ្នកប្រើប្រាស់
            </label>

            <input
              type="text"
              className="form-control rounded-3"
              name="username"
              placeholder="ជ្រើសរើសឈ្មោះអ្នកប្រើ"
              value={formData.username}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-3">

            <label className="form-label">
              អ៊ីមែល
            </label>

            <input
              type="email"
              className="form-control rounded-3"
              name="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="mb-3">

            <label className="form-label">
              ថ្នាក់រៀន
            </label>

            <select
              className="form-select rounded-3"
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              disabled={loadingClasses}
              required
            >

              <option value="">
                -- ជ្រើសរើសថ្នាក់ --
              </option>

              {classes.map((cls) => (

                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>

              ))}

            </select>

            {loadingClasses && (

              <small className="text-muted">
                កំពុងផ្ទុក...
              </small>

            )}

          </div>

          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                ពាក្យសម្ងាត់
              </label>

              <input
                type="password"
                className="form-control rounded-3"
                name="password"
                placeholder="ពាក្យសម្ងាត់"
                value={formData.password}
                onChange={handleChange}
                required
              />

            </div>

            <div className="col-md-6 mb-3">

              <label className="form-label">
                បញ្ជាក់ពាក្យសម្ងាត់
              </label>

              <input
                type="password"
                className="form-control rounded-3"
                name="confirmPassword"
                placeholder="បញ្ជាក់"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          <button
            type="submit"
            className="w-100 rounded-3 text-white fw-semibold py-2 mt-2 border-0"
            style={{
              background: '#0a4a38'
            }}
            disabled={loading}
          >

            {loading
              ? 'កំពុងចុះឈ្មោះ...'
              : 'ចុះឈ្មោះ'
            }

          </button>

        </form>

        <p className="text-center mt-4 mb-0 small">

          មានគណនីរួចហើយ?{' '}

          <Link
            to="/login"
            className="text-decoration-none fw-semibold"
            style={{ color: '#0a4a38' }}
          >
            ចូលប្រព័ន្ធ
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Register;