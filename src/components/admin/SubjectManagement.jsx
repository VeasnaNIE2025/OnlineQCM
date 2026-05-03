import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBook, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      console.log('Loading subjects...');
      const response = await api.get('/admin/subjects');
      console.log('Subjects loaded:', response.data);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('មិនអាចផ្ទុកទិន្នន័យមុខវិជ្ជាបានទេ');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        description: subject.description || '',
        isActive: subject.isActive
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        description: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({ name: '', description: '', isActive: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('សូមបញ្ចូលឈ្មោះមុខវិជ្ជា');
      return;
    }

    try {
      if (editingSubject) {
        await api.put(`/admin/subjects/${editingSubject.id}`, formData);
        toast.success('កែប្រែមុខវិជ្ជាបានជោគជ័យ');
      } else {
        await api.post('/admin/subjects', formData);
        toast.success('បង្កើតមុខវិជ្ជាថ្មីបានជោគជ័យ');
      }
      loadSubjects();
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'មានបញ្ហា សូមព្យាយាមម្តងទៀត');
    }
  };

  const handleToggleStatus = async (subject) => {
    try {
      await api.put(`/admin/subjects/${subject.id}`, { isActive: !subject.isActive });
      toast.success(`បាន${subject.isActive ? 'បិទ' : 'បើក'}មុខវិជ្ជា ${subject.name}`);
      loadSubjects();
    } catch (error) {
      toast.error('មិនអាចប្តូរស្ថានភាពបានទេ');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបមុខវិជ្ជា "${name}" មែនទេ?`)) {
      try {
        await api.delete(`/admin/subjects/${id}`);
        toast.success('លុបមុខវិជ្ជាបានជោគជ័យ');
        loadSubjects();
      } catch (error) {
        toast.error('មិនអាចលុបមុខវិជ្ជាបានទេ');
      }
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">កំពុងផ្ទុកទិន្នន័យ...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">📚 គ្រប់គ្រងមុខវិជ្ជា</h3>
          <p className="text-muted">បន្ថែម, កែប្រែ, និងគ្រប់គ្រងមុខវិជ្ជាទាំងអស់</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" /> បន្ថែមមុខវិជ្ជាថ្មី
        </button>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input type="text" className="form-control" placeholder="ស្វែងរកមុខវិជ្ជា..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="row">
        {filteredSubjects.length === 0 ? (
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <FaBook size={50} className="text-muted mb-3" />
                <h5>មិនមានទិន្នន័យមុខវិជ្ជា</h5>
              </div>
            </div>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div className="col-md-6 col-lg-4 mb-4" key={subject.id}>
              <div className={`card shadow-sm h-100 ${!subject.isActive ? 'bg-light' : ''}`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <FaBook size={24} className={`me-2 ${subject.isActive ? 'text-primary' : 'text-muted'}`} />
                      <h5 className="card-title mb-0">{subject.name}</h5>
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleOpenModal(subject)} title="កែប្រែ"><FaEdit /></button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggleStatus(subject)} title={subject.isActive ? 'បិទ' : 'បើក'}>{subject.isActive ? <FaToggleOff /> : <FaToggleOn />}</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(subject.id, subject.name)} title="លុប"><FaTrash /></button>
                    </div>
                  </div>
                  <p className="card-text text-muted small">{subject.description || 'គ្មានការពិពណ៌នា'}</p>
                  <div className="mt-3">
                    <span className={`badge ${subject.isActive ? 'bg-success' : 'bg-secondary'}`}>{subject.isActive ? 'សកម្ម' : 'បិទ'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingSubject ? '✏️ កែប្រែមុខវិជ្ជា' : '➕ បន្ថែមមុខវិជ្ជាថ្មី'}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">ឈ្មោះមុខវិជ្ជា <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ការពិពណ៌នា</label>
                    <textarea className="form-control" name="description" rows="3" value={formData.description} onChange={handleChange} />
                  </div>
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    <label className="form-check-label">សកម្ម</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>បោះបង់</button>
                  <button type="submit" className="btn btn-primary">{editingSubject ? 'រក្សាទុក' : 'បង្កើត'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;