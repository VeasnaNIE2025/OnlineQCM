import React, { useState, useEffect, useRef } from 'react';
import {
  FaEdit, FaTrash, FaPlus, FaSearch,
  FaUserGraduate, FaChalkboardTeacher, FaUserShield,
  FaToggleOn, FaToggleOff, FaFileExcel, FaUpload
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '', email: '', password: '',
    fullName: '', role: 'student', classId: '', isActive: true
  });

  useEffect(() => {
    loadUsers();
    loadClasses();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      toast.error('មិនអាចផ្ទុកទិន្នន័យអ្នកប្រើប្រាស់បានទេ');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch { /* silent */ }
  };

  const getRoleIcon = (role) => {
    if (role === 'admin') return <FaUserShield className="text-danger me-1" />;
    if (role === 'teacher') return <FaChalkboardTeacher className="text-success me-1" />;
    return <FaUserGraduate className="text-primary me-1" />;
  };

  const getRoleText = (role) => {
    if (role === 'admin') return 'អ្នកគ្រប់គ្រង';
    if (role === 'teacher') return 'គ្រូបង្រៀន';
    return 'សិស្ស';
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        fullName: user.fullName || '',
        role: user.role || 'student',
        classId: user.classId || '',
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({ username: '', email: '', password: '', fullName: '', role: 'student', classId: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'role' && value !== 'student' ? { classId: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.fullName) {
      toast.error('សូមបំពេញព័ត៌មានឲ្យបានពេញលេញ');
      return;
    }
    if (!editingUser && !formData.password) {
      toast.error('សូមបញ្ចូលពាក្យសម្ងាត់');
      return;
    }
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      if (payload.role !== 'student') payload.classId = null;

      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
        toast.success('កែប្រែអ្នកប្រើប្រាស់បានជោគជ័យ');
      } else {
        await userService.createUser(payload);
        toast.success('បង្កើតអ្នកប្រើប្រាស់ថ្មីបានជោគជ័យ');
      }
      loadUsers();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'មានបញ្ហា សូមព្យាយាមម្តងទៀត');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userService.updateUser(user.id, { ...user, isActive: !user.isActive });
      toast.success(`បាន${user.isActive ? 'បិទ' : 'បើក'}គណនី ${user.fullName}`);
      loadUsers();
    } catch {
      toast.error('មិនអាចប្តូរស្ថានភាពបានទេ');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់ "${name}" មែនទេ?`)) {
      try {
        await userService.deleteUser(id);
        toast.success('លុបអ្នកប្រើប្រាស់បានជោគជ័យ');
        loadUsers();
      } catch {
        toast.error('មិនអាចលុបអ្នកប្រើប្រាស់បានទេ');
      }
    }
  };

  // 📥 Export template
  const handleDownloadTemplate = async () => {
    try {
      const data = await userService.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'user_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('ទាញយក template បានជោគជ័យ');
    } catch {
      toast.error('មិនអាចទាញយក template បានទេ');
    }
  };

  // 📤 Import Excel
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const result = await userService.importUsers(file);
      toast.success(result.message);
      loadUsers(); // refresh list
      if (result.details?.errors?.length) {
        console.warn('Import errors:', result.details.errors);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'បរាជ័យក្នុងការ import');
    } finally {
      setImporting(false);
      e.target.value = ''; // clear input
    }
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2">កំពុងផ្ទុកទិន្នន័យ...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">👥 គ្រប់គ្រងអ្នកប្រើប្រាស់</h3>
          <p className="text-muted">គ្រប់គ្រងសិស្ស គ្រូបង្រៀន និងអ្នកគ្រប់គ្រងប្រព័ន្ធ</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success" onClick={handleDownloadTemplate}>
            <FaFileExcel className="me-2" /> ទាញយក Template
          </button>
          <button className="btn btn-outline-info" onClick={() => fileInputRef.current.click()}>
            <FaUpload className="me-2" /> Import Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={importing}
          />
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FaPlus className="me-2" /> បន្ថែមអ្នកប្រើប្រាស់ថ្មី
          </button>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល ឬឈ្មោះអ្នកប្រើប្រាស់..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>ឈ្មោះពេញ</th>
                  <th>ឈ្មោះអ្នកប្រើ</th>
                  <th>អ៊ីមែល</th>
                  <th>តួនាទី</th>
                  <th>ថ្នាក់</th>
                  <th>ស្ថានភាព</th>
                  <th style={{ width: 120 }}>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <FaUserGraduate size={50} className="mb-2" />
                      <p>មិនមានទិន្នន័យ</p>
                    </td>
                  </td>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td><strong>{user.fullName}</strong></td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {getRoleIcon(user.role)} {getRoleText(user.role)}
                        </span>
                      </td>
                      <td>
                        {user.role === 'student' ? (
                          <span className="badge bg-info text-dark">
                            {user.Class?.name || '—'}
                          </span>
                        ) : (
                          <span className="text-muted small">—</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {user.isActive ? 'សកម្ម' : 'បិទ'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleOpenModal(user)}
                            title="កែប្រែ"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleToggleStatus(user)}
                            title={user.isActive ? 'បិទ' : 'បើក'}
                          >
                            {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(user.id, user.fullName)}
                            disabled={user.role === 'admin'}
                            title={user.role === 'admin' ? 'មិនអាចលុប Admin' : 'លុប'}
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? '✏️ កែប្រែអ្នកប្រើប្រាស់' : '➕ បន្ថែមអ្នកប្រើប្រាស់ថ្មី'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">ឈ្មោះពេញ <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="បញ្ចូលឈ្មោះពេញ" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ឈ្មោះអ្នកប្រើប្រាស់ <span className="text-danger">*</span></label>
                    <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} required placeholder="ជ្រើសរើសឈ្មោះអ្នកប្រើប្រាស់" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">អ៊ីមែល <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required placeholder="example@email.com" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {editingUser ? 'ពាក្យសម្ងាត់ថ្មី (ទុកចាស់បើមិនចង់ប្តូរ)' : 'ពាក្យសម្ងាត់'}
                    </label>
                    <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required={!editingUser} placeholder={editingUser ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មី' : 'បញ្ចូលពាក្យសម្ងាត់'} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">តួនាទី</label>
                    <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                      <option value="student">សិស្ស</option>
                      <option value="teacher">គ្រូបង្រៀន</option>
                      <option value="admin">អ្នកគ្រប់គ្រង</option>
                    </select>
                  </div>
                  {formData.role === 'student' && (
                    <div className="mb-3">
                      <label className="form-label">ថ្នាក់</label>
                      <select className="form-select" name="classId" value={formData.classId} onChange={handleChange}>
                        <option value="">— មិនទាន់ assign ថ្នាក់ —</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    <label className="form-check-label">សកម្ម (អនុញ្ញាតឱ្យចូលប្រើប្រាស់)</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>បោះបង់</button>
                  <button type="submit" className="btn btn-primary">{editingUser ? 'រក្សាទុក' : 'បង្កើត'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;