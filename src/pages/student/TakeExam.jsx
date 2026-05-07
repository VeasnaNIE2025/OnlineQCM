import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import studentExamService from '../../services/studentExamService';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);
  const answersRef = useRef({});

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    loadExam();
  }, [id]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const data = await studentExamService.getExamDetails(id);
      setExam(data);
      setTimeLeft(data.duration * 60);
      const initial = {};
      data.Questions?.forEach((_, idx) => { initial[idx] = ''; });
      setAnswers(initial);
      answersRef.current = initial;
    } catch (error) {
      console.error('Load exam error:', error);
      toast.error(error.response?.data?.message || 'មិនអាចផ្ទុកការប្រឡងបានទេ');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!exam) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!submittingRef.current) {
            autoSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam]);

  const autoSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    toast.error('អស់ម៉ោងហើយ! កំពុង submit ស្វ័យប្រវត្តិ...');
    try {
      const answerArray = Object.values(answersRef.current);
      const result = await studentExamService.submitExam(id, answerArray);
      toast.success(`អស់ពេល! ពិន្ទុ: ${result.totalScore}/${result.totalPoints} (${result.percentage}%)`);
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Auto-submit error:', error);
      toast.error('មានបញ្ហាក្នុងការបញ្ជូនចម្លើយ');
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!window.confirm('តើអ្នកប្រាកដជាចង់បញ្ជូនចម្លើយហើយមែនទេ?')) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const answerArray = Object.values(answers);
      const result = await studentExamService.submitExam(id, answerArray);
      toast.success(`ប្រឡងបានបញ្ចប់! ពិន្ទុ: ${result.totalScore}/${result.totalPoints} (${result.percentage}%)`);
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'មានបញ្ហាក្នុងការបញ្ជូនចម្លើយ');
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.values(answers).filter(a => a !== '').length;
  const total = exam?.Questions?.length || 0;
  const currentQ = exam?.Questions?.[currentIndex];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">កំពុងផ្ទុកការប្រឡង...</p>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <div className="container py-4 fade-in">
      {/* Header */}
      <div className="card shadow-sm mb-4">
        <div className={`card-header text-white ${timeLeft <= 60 ? 'bg-danger' : timeLeft <= 300 ? 'bg-warning' : 'bg-primary'}`}>
          <div className="d-flex justify-content-between">
            <h4 className="mb-0">{exam.title}</h4>
            <h3 className="mb-0 font-monospace">{formatTime(timeLeft)}</h3>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6"><strong>មុខវិជ្ជា:</strong> {exam.subjectName}</div>
            <div className="col-md-6"><strong>វឌ្ឍនភាព:</strong> {answeredCount}/{total} សំណួរ</div>
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {exam.Questions?.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`btn ${currentIndex === idx ? 'btn-primary' : answers[idx] !== '' ? 'btn-success' : 'btn-outline-secondary'}`}
                style={{ width: '45px' }}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between">
            <strong>សំណួរទី {currentIndex + 1} / {total}</strong>
            <span className="badge bg-info">{currentQ?.points} ពិន្ទុ</span>
          </div>
        </div>
        <div className="card-body">
          <p className="mb-4 fs-5">{currentQ?.questionText}</p>
          
          {/* ✅ បង្ហាញរូបភាព (ប្រសិនបើមាន) */}
          {currentQ?.imageUrl && (
            <div className="text-center my-3">
              <img
                src={currentQ.imageUrl}
                alt="រូបភាពសម្រាប់សំណួរ"
                style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          
          {['a', 'b', 'c', 'd'].map(opt => (
            <div className="form-check mb-3" key={opt}>
              <input
                className="form-check-input"
                type="radio"
                name="answer"
                id={`opt${opt}`}
                value={opt}
                checked={answers[currentIndex] === opt}
                onChange={() => setAnswers(prev => ({ ...prev, [currentIndex]: opt }))}
              />
              <label className="form-check-label" htmlFor={`opt${opt}`}>
                <strong>{opt.toUpperCase()}.</strong> {currentQ?.[`option_${opt}`]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mb-5">
        <button
          className="btn btn-secondary btn-lg"
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
        >
          ◀ សំណួរមុន
        </button>
        {currentIndex === total - 1 ? (
          <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'កំពុងផ្ញើ...' : 'បញ្ជូនចម្លើយ ✓'}
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={() => setCurrentIndex(prev => prev + 1)}>
            សំណួរបន្ទាប់ ▶
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeExam;