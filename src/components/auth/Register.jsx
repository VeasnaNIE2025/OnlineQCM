// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import toast from 'react-hot-toast';
// import api from '../../services/api';

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@300;400;500;600;700&display=swap');

//   *{
//     box-sizing:border-box;
//   }

//   body{
//     margin:0;
//     padding:0;
//   }

//   .reg-page{
//     min-height:100vh;
//     display:flex;
//     align-items:center;
//     justify-content:center;
//     background:#f6f7fb;
//     padding:20px;
//     font-family:'Kantumruy Pro',sans-serif;
//   }

//   .reg-card{
//     width:100%;
//     max-width:430px;
//     background:#fff;
//     border-radius:18px;
//     padding:34px 28px;
//     box-shadow:0 10px 35px rgba(0,0,0,0.08);
//   }

//   .reg-header{
//     text-align:center;
//     margin-bottom:26px;
//   }

//   .reg-logo{
//     width:68px;
//     height:68px;
//     margin:0 auto 14px;
//     border-radius:18px;
//     background:#0a4a38;
//     color:#fff;
//     display:flex;
//     align-items:center;
//     justify-content:center;
//     font-size:30px;
//   }

//   .reg-heading{
//     font-family:'Kantumruy Pro',sans-serif;
//     font-size:25px;
//     color:#111827;
//     margin:0 0 6px;
//     font-weight:700;
//   }

//   .reg-sub{
//     font-size:13px;
//     color:#6b7280;
//     margin:0;
//   }

//   .field{
//     margin-bottom:16px;
//   }

//   .field label{
//     display:block;
//     margin-bottom:6px;
//     font-size:13px;
//     color:#374151;
//     font-weight:500;
//   }

//   .field input,
//   .field select{
//     width:100%;
//     height:46px;
//     border:1px solid #dcdfe4;
//     border-radius:10px;
//     padding:0 14px;
//     font-size:14px;
//     font-family:'Kantumruy Pro',sans-serif;
//     background:#fff;
//     transition:all .2s ease;
//   }

//   .field input:focus,
//   .field select:focus{
//     outline:none;
//     border-color:#0a4a38;
//     box-shadow:0 0 0 3px rgba(10,74,56,0.1);
//   }

//   .field input::placeholder{
//     color:#9ca3af;
//   }

//   .field-row{
//     display:grid;
//     grid-template-columns:1fr 1fr;
//     gap:14px;
//   }

//   .btn-submit{
//     width:100%;
//     height:48px;
//     border:none;
//     border-radius:10px;
//     background:#0a4a38;
//     color:#fff;
//     font-size:15px;
//     font-weight:600;
//     font-family:'Kantumruy Pro',sans-serif;
//     cursor:pointer;
//     transition:all .2s ease;
//     margin-top:8px;

//     display:flex;
//     align-items:center;
//     justify-content:center;
//     gap:8px;
//   }

//   .btn-submit:hover:not(:disabled){
//     background:#0d5c46;
//   }

//   .btn-submit:disabled{
//     opacity:.7;
//     cursor:not-allowed;
//   }

//   .loading-text{
//     margin-top:5px;
//     font-size:12px;
//     color:#888;
//   }

//   .login-link{
//     text-align:center;
//     margin-top:20px;
//     font-size:13px;
//     color:#666;
//   }

//   .login-link a{
//     color:#0a4a38;
//     text-decoration:none;
//     font-weight:600;
//   }

//   .login-link a:hover{
//     text-decoration:underline;
//   }

//   @media(max-width:600px){

//     .reg-card{
//       padding:28px 20px;
//     }

//     .field-row{
//       grid-template-columns:1fr;
//       gap:0;
//     }
//   }
// `;

// const Register = () => {

//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     fullName: '',
//     role: 'student',
//     classId: ''
//   });

//   const [classes, setClasses] = useState([]);
//   const [loadingClasses, setLoadingClasses] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const { register } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {

//     const fetchClasses = async () => {

//       setLoadingClasses(true);

//       try {

//         const res = await api.get('/classes');
//         setClasses(res.data);

//       } catch (err) {

//         console.error('Failed to load classes', err);
//         toast.error('មិនអាចផ្ទុកបញ្ជីថ្នាក់បានទេ');

//       } finally {

//         setLoadingClasses(false);

//       }
//     };

//     fetchClasses();

//   }, []);

//   const handleChange = (e) => {

//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });

//   };

//   const handleSubmit = async (e) => {

//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {

//       toast.error('ពាក្យសម្ងាត់មិនត្រូវគ្នា');
//       return;

//     }

//     if (!formData.classId) {

//       toast.error('សូមជ្រើសរើសថ្នាក់រៀន');
//       return;

//     }

//     setLoading(true);

//     try {

//       const { confirmPassword, ...userData } = formData;

//       await register(userData);

//       toast.success('ចុះឈ្មោះបានជោគជ័យ! សូមចូលប្រព័ន្ធ');

//       navigate('/login');

//     } catch (error) {

//       toast.error(
//         error.response?.data?.message || 'បរាជ័យក្នុងការចុះឈ្មោះ'
//       );

//     } finally {

//       setLoading(false);

//     }
//   };

//   return (
//     <>
//       <style>{styles}</style>

//       <div className="reg-page">

//         <div className="reg-card">

//           {/* Header */}
//           <div className="reg-header">

//             <div className="reg-logo">
//               📋
//             </div>

//             <h2 className="reg-heading">
//               បង្កើតគណនីថ្មី
//             </h2>

//             <p className="reg-sub">
//               ចុះឈ្មោះជាសិស្សថ្មីនៃប្រព័ន្ធ
//             </p>

//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} autoComplete="off">

//             <div className="field">

//               <label>ឈ្មោះពេញ</label>

//               <input
//                 type="text"
//                 name="fullName"
//                 placeholder="បញ្ចូលឈ្មោះពេញ"
//                 value={formData.fullName}
//                 onChange={handleChange}
//                 required
//               />

//             </div>

//             <div className="field">

//               <label>ឈ្មោះអ្នកប្រើប្រាស់</label>

//               <input
//                 type="text"
//                 name="username"
//                 placeholder="ជ្រើសរើសឈ្មោះអ្នកប្រើ"
//                 value={formData.username}
//                 onChange={handleChange}
//                 required
//               />

//             </div>

//             <div className="field">

//               <label>អ៊ីមែល</label>

//               <input
//                 type="email"
//                 name="email"
//                 placeholder="example@email.com"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//               />

//             </div>

//             <div className="field">

//               <label>ថ្នាក់រៀន</label>

//               <select
//                 name="classId"
//                 value={formData.classId}
//                 onChange={handleChange}
//                 required
//                 disabled={loadingClasses}
//               >

//                 <option value="">
//                   -- ជ្រើសរើសថ្នាក់ --
//                 </option>

//                 {classes.map((cls) => (

//                   <option key={cls.id} value={cls.id}>
//                     {cls.name}
//                   </option>

//                 ))}

//               </select>

//               {loadingClasses && (
//                 <p className="loading-text">
//                   កំពុងផ្ទុក...
//                 </p>
//               )}

//             </div>

//             <div className="field-row">

//               <div className="field">

//                 <label>ពាក្យសម្ងាត់</label>

//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="បង្កើតពាក្យសម្ងាត់"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                 />

//               </div>

//               <div className="field">

//                 <label>បញ្ជាក់ពាក្យសម្ងាត់</label>

//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   placeholder="បញ្ជាក់ពាក្យសម្ងាត់"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   required
//                 />

//               </div>

//             </div>

//             <button
//               type="submit"
//               className="btn-submit"
//               disabled={loading}
//             >

//               {loading
//                 ? 'កំពុងចុះឈ្មោះ...'
//                 : 'ចុះឈ្មោះ'
//               }

//             </button>

//           </form>

//           <p className="login-link">

//             មានគណនីរួចហើយ?{' '}

//             <Link to="/login">
//               ចូលប្រព័ន្ធ
//             </Link>

//           </p>

//         </div>

//       </div>
//     </>
//   );
// };

// export default Register;

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
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-4"
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
            className="btn w-100 rounded-3 text-white fw-semibold py-2 mt-2"
            style={{ background: '#0a4a38' }}
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