// frontend/src/components/admin/QuestionManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaQuestionCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import questionService from '../../services/questionService';
import subjectService from '../../services/subjectService';
import api from '../../services/api';

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    subjectId: '',
    questionText: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correctAnswer: 'a',
    explanation: '',
    difficulty: 'medium',
    points: 1,
    imageUrl: ''
  });

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // ---------- Load subjects ----------
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjectsData = await subjectService.getSubjects();
        setSubjects(subjectsData.filter((s) => s.isActive));
      } catch (error) {
        toast.error('មិនអាចផ្ទុកមុខវិជ្ជាបានទេ');
      }
    };
    loadSubjects();
  }, []);

  // ---------- Load questions with filters ----------
  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (searchTerm) params.search = searchTerm;

      const data = await questionService.getQuestions(params);
      setQuestions(data);
    } catch (error) {
      toast.error('មិនអាចផ្ទុកសំណួរបានទេ');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedDifficulty, searchTerm]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // ---------- Image upload ----------
  // const handleImageUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const formDataUpload = new FormData();
  //   formDataUpload.append('image', file);

  //   setUploading(true);
  //   try {
  //     const response = await api.post('/admin/upload-image', formDataUpload, {
  //       headers: { 'Content-Type': 'multipart/form-data' }
  //     });
  //     const uploadedUrl = response.data.imageUrl;
  //     setFormData(prev => ({ ...prev, imageUrl: uploadedUrl }));
  //     setImagePreview(uploadedUrl);
  //     toast.success('រូបភាពបានផ្ទុកឡើងដោយជោគជ័យ');
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     toast.error('មិនអាចផ្ទុករូបភាពបានទេ');
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ត្រួតពិនិត្យ format មុន upload
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('រូបភាពត្រូវតែជា JPG, PNG, GIF, ឬ WEBP');
    e.target.value = '';
    return;
  }

  const formDataUpload = new FormData();
  formDataUpload.append('image', file);

  setUploading(true);
  try {
    const response = await api.post('/admin/upload-image', formDataUpload, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setFormData(prev => ({ ...prev, imageUrl: response.data.imageUrl }));
    setImagePreview(response.data.imageUrl);
    toast.success('រូបភាពបានផ្ទុកឡើងដោយជោគជ័យ');
  } catch (error) {
    // បង្ហាញ error message ពី server ផ្ទាល់
    const msg = error.response?.data?.message || 'មិនអាចផ្ទុករូបភាពបានទេ';
    toast.error(msg);
    e.target.value = '';
  } finally {
    setUploading(false);
  }
};

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview('');
  };

  // ---------- Open modal (create / edit) ----------
  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        subjectId: question.subjectId || '',
        questionText: question.questionText || '',
        option_a: question.option_a || '',
        option_b: question.option_b || '',
        option_c: question.option_c || '',
        option_d: question.option_d || '',
        correctAnswer: question.correctAnswer || 'a',
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'medium',
        points: question.points || 1,
        imageUrl: question.imageUrl || ''
      });
      setImagePreview(question.imageUrl || '');
    } else {
      setEditingQuestion(null);
      setFormData({
        subjectId: subjects[0]?.id || '',
        questionText: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correctAnswer: 'a',
        explanation: '',
        difficulty: 'medium',
        points: 1,
        imageUrl: ''
      });
      setImagePreview('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setImagePreview('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------- Submit (create / update) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.subjectId ||
      !formData.questionText ||
      !formData.option_a ||
      !formData.option_b ||
      !formData.option_c ||
      !formData.option_d
    ) {
      toast.error('សូមបំពេញព័ត៌មានឲ្យបានពេញលេញ');
      return;
    }

    try {
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, formData);
        toast.success('កែប្រែសំណួរបានជោគជ័យ');
      } else {
        await questionService.createQuestion(formData);
        toast.success('បង្កើតសំណួរថ្មីបានជោគជ័យ');
      }
      loadQuestions();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'មានបញ្ហា សូមព្យាយាមម្តងទៀត');
    }
  };

  // ---------- Delete ----------
  const handleDelete = async (id, questionText) => {
    if (
      window.confirm(`តើអ្នកពិតជាចង់លុបសំណួរ "${questionText.substring(0, 50)}..." មែនទេ?`)
    ) {
      try {
        await questionService.deleteQuestion(id);
        toast.success('លុបសំណួរបានជោគជ័យ');
        loadQuestions();
      } catch (error) {
        toast.error('មិនអាចលុបសំណួរបានទេ');
      }
    }
  };

  // ---------- Helper UI ----------
  const getDifficultyBadge = (difficulty) => {
    const colors = { easy: 'success', medium: 'warning', hard: 'danger' };
    const labels = { easy: 'ស្រួល', medium: 'មធ្យម', hard: 'ពិបាក' };
    return <span className={`badge bg-${colors[difficulty]}`}>{labels[difficulty]}</span>;
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : 'មិនស្គាល់';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">❓ គ្រប់គ្រងសំណួរ</h3>
          <p className="text-muted">បន្ថែម, កែប្រែ, និងគ្រប់គ្រងសំណួរប្រឡង QCM</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" /> បន្ថែមសំណួរថ្មី
        </button>
      </div>

      {/* Filters */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text"><FaSearch /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ស្វែងរកសំណួរ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">មុខវិជ្ជាទាំងអស់</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="">កម្រិតទាំងអស់</option>
                <option value="easy">ស្រួល</option>
                <option value="medium">មធ្យម</option>
                <option value="hard">ពិបាក</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>សំណួរ</th>
                  <th>មុខវិជ្ជា</th>
                  <th>កម្រិត</th>
                  <th>ពិន្ទុ</th>
                  <th style={{ width: '100px' }}>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <FaQuestionCircle size={50} className="text-muted mb-2" />
                      <p>មិនមានទិន្នន័យសំណួរ</p>
                    </td>
                  </tr>
                ) : (
                  questions.map((question, index) => (
                    <tr key={question.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '300px' }}>
                          {question.questionText}
                        </div>
                        <small className="text-muted">
                          ចម្លើយត្រឹមត្រូវ: {question.correctAnswer.toUpperCase()}
                        </small>
                      </td>
                      <td>{getSubjectName(question.subjectId)}</td>
                      <td>{getDifficultyBadge(question.difficulty)}</td>
                      <td>{question.points}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleOpenModal(question)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(question.id, question.questionText)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'auto' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingQuestion ? '✏️ កែប្រែសំណួរ' : '➕ បន្ថែមសំណួរថ្មី'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">

                  {/* Subject */}
                  <div className="mb-3">
                    <label className="form-label">មុខវិជ្ជា <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">ជ្រើសរើសមុខវិជ្ជា</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Question text */}
                  <div className="mb-3">
                    <label className="form-label">សំណួរ <span className="text-danger">*</span></label>
                    <textarea
                      className="form-control"
                      name="questionText"
                      rows="2"
                      value={formData.questionText}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Options */}
                  <div className="row">
                    {['a', 'b', 'c', 'd'].map((opt) => (
                      <div className="col-md-6 mb-3" key={opt}>
                        <label className="form-label">
                          ជម្រើស {opt.toUpperCase()} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name={`option_${opt}`}
                          value={formData[`option_${opt}`]}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct answer / difficulty / points */}
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ចម្លើយត្រឹមត្រូវ</label>
                      <select
                        className="form-select"
                        name="correctAnswer"
                        value={formData.correctAnswer}
                        onChange={handleChange}
                      >
                        <option value="a">A</option>
                        <option value="b">B</option>
                        <option value="c">C</option>
                        <option value="d">D</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">កម្រិត</label>
                      <select
                        className="form-select"
                        name="difficulty"
                        value={formData.difficulty}
                        onChange={handleChange}
                      >
                        <option value="easy">ស្រួល</option>
                        <option value="medium">មធ្យម</option>
                        <option value="hard">ពិបាក</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ពិន្ទុ</label>
                      <input
                        type="number"
                        className="form-control"
                        name="points"
                        value={formData.points}
                        onChange={handleChange}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="mb-3">
                    <label className="form-label">ការពន្យល់</label>
                    <textarea
                      className="form-control"
                      name="explanation"
                      rows="2"
                      value={formData.explanation}
                      onChange={handleChange}
                      placeholder="ពន្យល់ពីចម្លើយត្រឹមត្រូវ..."
                    />
                  </div>

                  {/* Image upload */}
                  <div className="mb-3">
                    <label className="form-label">រូបភាពសម្រាប់សំណួរ (ស្រេចចិត្ត)</label>

                    {/* Preview — shown after upload */}
                    {imagePreview && (
                      <div className="mb-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '150px',
                            objectFit: 'contain',
                            display: 'block',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            handleRemoveImage();
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger mt-2"
                          onClick={handleRemoveImage}
                        >
                          លុបរូបភាព
                        </button>
                      </div>
                    )}

                    {/* File input — hidden once preview exists */}
                    {!imagePreview && (
                      <>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                        {uploading && (
                          <div className="d-flex align-items-center gap-2 mt-2">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <small className="text-muted">កំពុងផ្ទុករូបភាព...</small>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    បោះបង់
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>
                    {editingQuestion ? 'រក្សាទុក' : 'បង្កើត'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;