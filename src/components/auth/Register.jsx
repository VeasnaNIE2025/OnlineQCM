import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Khmer:wght@400;600&family=DM+Sans:wght@300;400;500&display=swap');

  .reg-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f3ee;
    padding: 2rem 1rem;
  }

  .reg-card {
    display: flex;
    width: 720px;
    max-width: 100%;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12);
  }

  /* ── Left decorative panel ── */
  .reg-panel {
    width: 200px;
    flex-shrink: 0;
    background: #0a4a38;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    position: relative;
    overflow: hidden;
  }

  .reg-panel-deco {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
    pointer-events: none;
  }

  .reg-panel-inner {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .reg-lotus {
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
  }

  .reg-panel-title {
    font-family: 'Noto Serif Khmer', serif;
    color: #e8d5a3;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.6;
    margin: 0 0 12px;
  }

  .reg-panel-sub {
    color: #9fcfb8;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    line-height: 1.7;
    margin: 0;
  }

  /* ── Right form area ── */
  .reg-form-area {
    flex: 1;
    background: #fff;
    padding: 2.5rem 2rem;
    overflow-y: auto;
    font-family: 'DM Sans', sans-serif;
  }

  .reg-heading {
    font-family: 'Noto Serif Khmer', serif;
    font-size: 22px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px;
  }

  .reg-sub {
    font-size: 13px;
    color: #888;
    margin: 0 0 1.75rem;
  }

  .field-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .field {
    margin-bottom: 16px;
  }

  .field label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #555;
    margin-bottom: 6px;
    letter-spacing: 0.02em;
  }

  .field input,
  .field select {
    width: 100%;
    box-sizing: border-box;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #ddd;
    border-radius: 7px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
    background: #fafaf9;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }

  .field input:focus,
  .field select:focus {
    border-color: #1D9E75;
    box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
    background: #fff;
  }

  .field input::placeholder {
    color: #bbb;
    font-size: 12px;
  }

  /* Role tabs */
  .role-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .role-tab {
    flex: 1;
    height: 36px;
    border-radius: 7px;
    border: 1px solid #ddd;
    background: #fafaf9;
    font-size: 12px;
    font-family: 'Noto Serif Khmer', serif;
    color: #888;
    cursor: pointer;
    transition: all 0.18s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    user-select: none;
  }

  .role-tab:hover {
    border-color: #1D9E75;
    color: #0F6E56;
  }

  .role-tab.active {
    background: #0a4a38;
    color: #e8d5a3;
    border-color: #0a4a38;
  }

  .role-tab svg {
    width: 14px;
    height: 14px;
  }

  /* Class hint badge */
  .class-note {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: rgba(29,158,117,0.1);
    color: #0F6E56;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 20px;
    margin-bottom: 7px;
  }

  .loading-text {
    font-size: 11px;
    color: #aaa;
    margin-top: 4px;
  }

  /* Submit button */
  .btn-submit {
    width: 100%;
    height: 44px;
    background: #0a4a38;
    color: #e8d5a3;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-family: 'Noto Serif Khmer', serif;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: background 0.2s, transform 0.1s;
    margin-top: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-submit:hover:not(:disabled) { background: #0d5c46; }
  .btn-submit:active:not(:disabled) { transform: scale(0.99); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  .login-link {
    text-align: center;
    font-size: 13px;
    color: #888;
    margin-top: 16px;
  }

  .login-link a {
    color: #1D9E75;
    text-decoration: none;
    font-weight: 500;
  }

  .login-link a:hover { text-decoration: underline; }

  @media (max-width: 600px) {
    .reg-panel { display: none; }
    .field-row { grid-template-columns: 1fr; }
    .reg-form-area { padding: 2rem 1.25rem; }
  }
`;

// Simple icon components
const IconSchool = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconTeacher = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);
const IconAdmin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

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
        console.error('Failed to load classes', err);
        toast.error('មិនអាចផ្ទុកបញ្ជីថ្នាក់បានទេ');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setRole = (role) => {
    setFormData({ ...formData, role, classId: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('ពាក្យសម្ងាត់មិនត្រូវគ្នា');
      return;
    }
    if (formData.role === 'student' && !formData.classId) {
      toast.error('សូមជ្រើសរើសថ្នាក់រៀន');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      if (userData.role !== 'student') delete userData.classId;
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
    <>
      <style>{styles}</style>
      <div className="reg-page">
        <div className="reg-card">

          {/* ── Decorative left panel ── */}
          <div className="reg-panel">
            <svg className="reg-panel-deco" viewBox="0 0 200 600" xmlns="http://www.w3.org/2000/svg">
              {[100, 300, 500].map(cy => (
                <g key={cy}>
                  <circle cx="100" cy={cy} r="80" fill="none" stroke="#e8d5a3" strokeWidth="1"/>
                  <circle cx="100" cy={cy} r="55" fill="none" stroke="#e8d5a3" strokeWidth="0.5"/>
                  <circle cx="100" cy={cy} r="30" fill="none" stroke="#e8d5a3" strokeWidth="0.5"/>
                </g>
              ))}
              <line x1="100" y1="0" x2="100" y2="600" stroke="#e8d5a3" strokeWidth="0.5"/>
              {[100, 300, 500].map(cy => (
                <g key={`h${cy}`}>
                  <line x1="0" y1={cy} x2="200" y2={cy} stroke="#e8d5a3" strokeWidth="0.5"/>
                  <line x1="43" y1={cy-43} x2="157" y2={cy+43} stroke="#e8d5a3" strokeWidth="0.4"/>
                  <line x1="43" y1={cy+43} x2="157" y2={cy-43} stroke="#e8d5a3" strokeWidth="0.4"/>
                </g>
              ))}
            </svg>
            <div className="reg-panel-inner">
              {/* Lotus SVG */}
              <svg className="reg-lotus" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="36" cy="48" rx="8" ry="14" fill="#1D9E75" opacity="0.8"/>
                <ellipse cx="20" cy="44" rx="7" ry="12" transform="rotate(-25 20 44)" fill="#1D9E75" opacity="0.65"/>
                <ellipse cx="52" cy="44" rx="7" ry="12" transform="rotate(25 52 44)" fill="#1D9E75" opacity="0.65"/>
                <ellipse cx="9" cy="37" rx="5.5" ry="9" transform="rotate(-48 9 37)" fill="#0F6E56" opacity="0.5"/>
                <ellipse cx="63" cy="37" rx="5.5" ry="9" transform="rotate(48 63 37)" fill="#0F6E56" opacity="0.5"/>
                <circle cx="36" cy="38" r="7" fill="#e8d5a3" opacity="0.95"/>
                <circle cx="36" cy="38" r="3.5" fill="#ba7517" opacity="0.6"/>
              </svg>
              <h2 className="reg-panel-title">គ្រឹះស្ថាន<br/>សិក្សា</h2>
              <p className="reg-panel-sub">ចាប់ផ្ដើម<br/>ដំណើរការ<br/>សិក្សាថ្មី</p>
            </div>
          </div>

          {/* ── Form area ── */}
          <div className="reg-form-area">
            <h2 className="reg-heading">បង្កើតគណនីថ្មី</h2>
            <p className="reg-sub">Fill in your details to get started</p>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="field-row">
                <div className="field">
                  <label>ឈ្មោះពេញ</label>
                  <input type="text" name="fullName" placeholder="ឈ្មោះពេញ" value={formData.fullName} onChange={handleChange} required/>
                </div>
                <div className="field">
                  <label>ឈ្មោះអ្នកប្រើ</label>
                  <input type="text" name="username" placeholder="username" value={formData.username} onChange={handleChange} required/>
                </div>
              </div>

              <div className="field">
                <label>អ៊ីមែល</label>
                <input type="email" name="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} required/>
              </div>

              <div className="field">
                <label>តួនាទី</label>
                <div className="role-tabs">
                  {[
                    { value: 'student', label: 'សិស្ស', Icon: IconSchool },
                    { value: 'teacher', label: 'គ្រូ', Icon: IconTeacher },
                    { value: 'admin', label: 'Admin', Icon: IconAdmin }
                  ].map(({ value, label, Icon }) => (
                    <div
                      key={value}
                      className={`role-tab${formData.role === value ? ' active' : ''}`}
                      onClick={() => setRole(value)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setRole(value)}
                    >
                      <Icon/> {label}
                    </div>
                  ))}
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="field">
                  <label>ថ្នាក់រៀន</label>
                  <span className="class-note">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
                    ចំពោះសិស្សប៉ុណ្ណោះ
                  </span>
                  <select name="classId" value={formData.classId} onChange={handleChange} required disabled={loadingClasses}>
                    <option value="">-- ជ្រើសរើសថ្នាក់ --</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                  {loadingClasses && <p className="loading-text">កំពុងផ្ទុក...</p>}
                </div>
              )}

              <div className="field-row">
                <div className="field">
                  <label>ពាក្យសម្ងាត់</label>
                  <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required/>
                </div>
                <div className="field">
                  <label>បញ្ជាក់ពាក្យសម្ងាត់</label>
                  <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required/>
                </div>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'កំពុងចុះឈ្មោះ...' : 'ចុះឈ្មោះ →'}
              </button>
            </form>

            <p className="login-link">
              មានគណនីរួចហើយ? <Link to="/login">ចូលប្រព័ន្ធ</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Register;