import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FounderImg from '../assets/Founder.jpg';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [count, setCount] = useState(10);

  // Auto redirect after 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGoHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGoHome = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'teacher') {
      navigate('/teacher/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* 404 + message */}
        <div style={styles.code}>404</div>
        <h2 style={styles.title}>រកមិនឃើញទំព័រ</h2>
        <p style={styles.subtitle}>
          ទំព័រដែលអ្នកស្វែងរក មិនមាន ឬ ត្រូវបានផ្លាស់ប្តូររួចហើយ
        </p>

        {/* Founder avatar */}
        <div style={styles.avatarWrap}>
          <div style={styles.outerRing}>
            <div style={styles.innerRing}>
              <img src={FounderImg} alt="Founder" style={styles.avatar} />
            </div>
          </div>
          <div style={styles.founderBadge}>FOUNDER</div>
        </div>

        {/* Founder info */}
        <h3 style={styles.founderName}>
          សូមទាក់ទងអ្នកគ្រប់គ្រង លោក ម៉ាន់ វាសនា
        </h3>
        <div style={styles.infoRow}>
          <span style={styles.infoIcon}>📞</span>
          <span style={styles.infoText}>តេលេក្រោម +8850967932240</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoIcon}>✉️</span>
          <span style={styles.infoText}>
            អ៊ីមែល <strong>manveasna1994@gmail.com</strong>
          </span>
        </div>

        {/* Countdown + button */}
        <div style={styles.countdownWrap}>
          <div style={styles.countdownDot}>{count}</div>
          <span style={styles.countdownLabel}>វិនាទីទៀតនឹង redirect</span>
        </div>

        <button
          onClick={handleGoHome}
          style={styles.btn}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          ត្រឡប់ទៅទំព័រដើម
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .qcm-outer { animation: spin 8s linear infinite; }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Hanuman', 'Kantumruy Pro', sans-serif",
    padding: '1rem',
  },
  card: {
    background: '#ffffff',
    border: '3px solid #e63946',
    borderRadius: '16px',
    padding: '2rem 2rem 1.5rem',
    maxWidth: '420px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    animation: 'fadeUp 0.5s ease both',
    gap: '4px',
  },
  code: {
    fontSize: '72px',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 1,
    marginBottom: '4px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 16px',
    lineHeight: 1.6,
  },
  avatarWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '12px',
  },
  outerRing: {
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    background: 'conic-gradient(#e63946 0deg, #1d4ed8 180deg, #e63946 360deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    marginBottom: '8px',
  },
  innerRing: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '4px solid #ffffff',
    overflow: 'hidden',
    background: '#e2e8f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
  },
  founderBadge: {
    background: '#1d4ed8',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    padding: '3px 14px',
    borderRadius: '20px',
  },
  founderName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '8px 0 12px',
    lineHeight: 1.5,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
    fontSize: '14px',
    color: '#334155',
  },
  infoIcon: {
    fontSize: '16px',
  },
  infoText: {
    fontSize: '14px',
    color: '#334155',
  },
  countdownWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '16px',
    marginBottom: '12px',
    padding: '8px 18px',
    background: '#eff6ff',
    borderRadius: '10px',
    border: '1px solid #bfdbfe',
  },
  countdownDot: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#1d4ed8',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  countdownLabel: {
    fontSize: '13px',
    color: '#1d4ed8',
    fontWeight: '500',
  },
  btn: {
    padding: '10px 28px',
    background: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    fontFamily: 'inherit',
    marginBottom: '4px',
  },
};

export default NotFound;