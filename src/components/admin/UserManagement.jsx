import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import toast from 'react-hot-toast';
import userService from '../../services/userService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'student',
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('មិនអាចផ្ទុកទិន្នន័យអ្នកប្រើប្រាស់បានទេ');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'student',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'student',
      isActive: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userService.updateUser(editingUser.id, updateData);
        toast.success('កែប្រែអ្នកប្រើប្រាស់បានជោគជ័យ');
      } else {
        await userService.createUser(formData);
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
      await userService.updateUser(user.id, {
        ...user,
        isActive: !user.isActive
      });
      toast.success(`បាន${user.isActive ? 'បិទ' : 'បើក'}គណនី ${user.fullName}`);
      loadUsers();
    } catch (error) {
      toast.error('មិនអាចប្តូរស្ថានភាពបានទេ');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់ "${name}" មែនទេ?`)) {
      try {
        await userService.deleteUser(id);
        toast.success('លុបអ្នកប្រើប្រាស់បានជោគជ័យ');
        loadUsers();
      } catch (error) {
        toast.error('មិនអាចលុបអ្នកប្រើប្រាស់បានទេ');
      }
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FaUserShield className="text-danger" />;
      case 'teacher': return <FaChalkboardTeacher className="text-success" />;
      default: return <FaUserGraduate className="text-primary" />;
    }
  };

  const getRoleText = (role) => {
    switch(role) {
      case 'admin': return 'អ្នកគ្រប់គ្រង';
      case 'teacher': return 'គ្រូបង្រៀន';
      default: return 'សិស្ស';
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">👥 គ្រប់គ្រងអ្នកប្រើប្រាស់</h3>
          <p className="text-muted">គ្រប់គ្រងសិស្ស គ្រូបង្រៀន និងអ្នកគ្រប់គ្រងប្រព័ន្ធ</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" /> បន្ថែមអ្នកប្រើប្រាស់ថ្មី
        </button>
      </div>

      {/* Search Bar */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FaSearch className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="ស្វែងរកតាមឈ្មោះ អ៊ីមែល ឬឈ្មោះអ្នកប្រើប្រាស់..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>ឈ្មោះពេញ</th>
                  <th>ឈ្មោះអ្នកប្រើ</th>
                  <th>អ៊ីមែល</th>
                  <th>តួនាទី</th>
                  <th>ស្ថានភាព</th>
                  <th style={{ width: '120px' }}>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <FaUserGraduate size={50} className="mb-2" />
                        <p>មិនមានទិន្នន័យអ្នកប្រើប្រាស់</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{user.fullName}</strong>
                      </td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {getRoleIcon(user.role)} {getRoleText(user.role)}
                        </span>
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
                            title={user.role === 'admin' ? 'មិនអាចលុប Admin បានទេ' : 'លុប'}
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
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">ឈ្មោះពេញ <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="បញ្ចូលឈ្មោះពេញ"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">ឈ្មោះអ្នកប្រើប្រាស់ <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="ជ្រើសរើសឈ្មោះអ្នកប្រើប្រាស់"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">អ៊ីមែល <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      {editingUser ? 'ពាក្យសម្ងាត់ថ្មី (ទុកចាស់បើមិនចង់ប្តូរ)' : 'ពាក្យសម្ងាត់'}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!editingUser}
                      placeholder={editingUser ? 'បញ្ចូលពាក្យសម្ងាត់ថ្មី' : 'បញ្ចូលពាក្យសម្ងាត់'}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">តួនាទី</label>
                    <select
                      className="form-select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="student">សិស្ស</option>
                      <option value="teacher">គ្រូបង្រៀន</option>
                      <option value="admin">អ្នកគ្រប់គ្រង</option>
                    </select>
                  </div>
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    <label className="form-check-label">
                      សកម្ម (អនុញ្ញាតឱ្យចូលប្រើប្រាស់)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    បោះបង់
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'រក្សាទុក' : 'បង្កើត'}
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

export default UserManagement;