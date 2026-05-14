import { useState, useEffect } from 'react';
import assignmentService from '../../services/assignmentService';

const GradeSubmission = ({ assignmentId }) => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [grading, setGrading]   = useState({});
  const [saving, setSaving]     = useState(null);
  const [viewingUrl, setViewingUrl]   = useState(null);
  const [viewingName, setViewingName] = useState('');

  useEffect(() => { fetchSubmissions(); }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.getSubmissions(assignmentId);
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (submissionId, field, value) => {
    setGrading(prev => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: value }
    }));
  };

  const handleGradeSubmit = async (submissionId) => {
    const current  = grading[submissionId] || {};
    const existing = data.submissions.find(s => s.id === submissionId);
    const grade    = current.grade    !== undefined ? current.grade    : existing?.grade;
    const feedback = current.feedback !== undefined ? current.feedback : existing?.feedback;

    if (grade === '' || grade === undefined || grade === null) {
      return alert('សូមបញ្ចូលពិន្ទុ!');
    }

    setSaving(submissionId);
    try {
      await assignmentService.gradeSubmission(submissionId, grade, feedback);
      fetchSubmissions();
    } catch (error) {
      alert(error.response?.data?.message || 'មានបញ្ហា!');
    } finally {
      setSaving(null);
    }
  };

  const getGradeColor = (grade, total) => {
    const pct = (grade / total) * 100;
    if (pct >= 80) return { bar: 'bg-success', text: 'text-success' };
    if (pct >= 50) return { bar: 'bg-warning', text: 'text-warning' };
    return { bar: 'bg-danger', text: 'text-danger' };
  };

  const gradedCount = data?.submissions.filter(s => s.status === 'graded').length || 0;
  const totalCount  = data?.submissions.length || 0;

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-border text-primary me-3" />
      <span className="text-muted">កំពុងទាញទិន្នន័យ...</span>
    </div>
  );

  if (!data) return <div className="alert alert-danger">រកមិនឃើញទិន្នន័យ!</div>;

  return (
    <div>
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="card-body p-4 text-white">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h4 className="fw-bold mb-1">{data.assignment.title}</h4>
              <p className="mb-0 opacity-75 small">
                📅 ថ្ងៃផុតកំណត់៖ {new Date(data.assignment.dueDate).toLocaleString('km-KH')}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-25 rounded-3 px-3 py-2">
                <div className="fw-bold fs-4">{data.totalSubmissions}</div>
                <div className="small opacity-75">ស្នាដៃ</div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="d-flex justify-content-between small mb-1">
              <span>ដំណើរការ</span>
              <span>{gradedCount}/{totalCount} បានដាក់ពិន្ទុ</span>
            </div>
            <div className="progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.3)' }}>
              <div className="progress-bar bg-white"
                style={{ width: totalCount > 0 ? `${(gradedCount/totalCount)*100}%` : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fs-4 fw-bold text-primary">{totalCount}</div>
            <div className="small text-muted">សរុប</div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fs-4 fw-bold text-success">{gradedCount}</div>
            <div className="small text-muted">បានពិន្ទុ</div>
          </div>
        </div>
        <div className="col-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fs-4 fw-bold text-warning">{totalCount - gradedCount}</div>
            <div className="small text-muted">រង់ចាំ</div>
          </div>
        </div>
      </div>

      {/* Empty */}
      {data.submissions.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div style={{ fontSize: '3rem' }}>📭</div>
          <h5 className="text-muted mt-2">មិនទាន់មានការដាក់ស្នាដៃ</h5>
          <p className="text-muted small">សិស្សមិនទាន់ upload ឯកសារ</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {data.submissions.map(sub => {
            const isGraded = sub.status === 'graded';
            const colors   = isGraded ? getGradeColor(sub.grade, data.assignment.totalPoints) : null;

            return (
              <div key={sub.id} className="card border-0 shadow-sm overflow-hidden">
                <div style={{
                  height: '4px',
                  background: isGraded
                    ? 'linear-gradient(90deg, #28a745, #20c997)'
                    : 'linear-gradient(90deg, #ffc107, #fd7e14)'
                }} />

                <div className="card-body p-4">
                  <div className="row align-items-start g-3">

                    {/* Left: Student Info */}
                    <div className="col-md-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                          style={{
                            width: '48px', height: '48px', fontSize: '1.2rem',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)'
                          }}>
                          {sub.student?.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{sub.student?.fullName}</h6>
                          <p className="text-muted small mb-1">{sub.student?.email}</p>
                          <span className={`badge ${isGraded ? 'bg-success' : 'bg-warning text-dark'}`}
                            style={{ fontSize: '0.7rem' }}>
                            {isGraded ? '✅ បានដាក់ពិន្ទុ' : '⏳ រង់ចាំ'}
                          </span>
                        </div>
                      </div>

                      {/* View File Button */}
                      <div className="mt-3">
                        <button
                          className="btn btn-outline-primary btn-sm w-100"
                          onClick={() => {
                            setViewingUrl(sub.fileUrl);
                            setViewingName(sub.fileName || 'ឯកសារ');
                          }}>
                          📄 មើលឯកសារ
                        </button>
                      </div>

                      {/* Grade Result */}
                      {isGraded && (
                        <div className={`mt-2 text-center fw-bold ${colors.text}`}>
                          {sub.grade} / {data.assignment.totalPoints} ពិន្ទុ
                          <div className="progress mt-1" style={{ height: '4px' }}>
                            <div className={`progress-bar ${colors.bar}`}
                              style={{ width: `${(sub.grade / data.assignment.totalPoints) * 100}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Grade Form */}
                    <div className="col-md-8">
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label small fw-medium text-muted">
                            ពិន្ទុ / {data.assignment.totalPoints}
                          </label>
                          <input
                            type="number" min={0} max={data.assignment.totalPoints}
                            defaultValue={sub.grade ?? ''}
                            onChange={e => handleGradeChange(sub.id, 'grade', e.target.value)}
                            className="form-control form-control-lg text-center fw-bold"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-md-8">
                          <label className="form-label small fw-medium text-muted">
                            មតិកែលម្អ
                          </label>
                          <input
                            type="text"
                            defaultValue={sub.feedback ?? ''}
                            onChange={e => handleGradeChange(sub.id, 'feedback', e.target.value)}
                            className="form-control form-control-lg"
                            placeholder="សរសេរមតិ..."
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => handleGradeSubmit(sub.id)}
                          disabled={saving === sub.id}
                          className={`btn w-100 fw-medium ${isGraded ? 'btn-outline-success' : 'btn-success'}`}>
                          {saving === sub.id ? (
                            <><span className="spinner-border spinner-border-sm me-2" />កំពុងរក្សាទុក...</>
                          ) : isGraded ? '✏️ កែប្រែពិន្ទុ' : '💾 រក្សាទុកពិន្ទុ'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingUrl && (
        <div className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={e => { if (e.target === e.currentTarget) setViewingUrl(null); }}>
          <div className="modal-dialog modal-xl modal-dialog-centered"
            style={{ maxWidth: '90vw' }}>
            <div className="modal-content border-0 shadow-lg">

              {/* Modal Header */}
              <div className="modal-header border-0 pb-2"
                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                <div className="d-flex align-items-center gap-2 text-white">
                  <span style={{ fontSize: '1.2rem' }}>📄</span>
                  <h6 className="modal-title mb-0 text-white fw-bold">{viewingName}</h6>
                </div>
                <div className="d-flex gap-2">
                  <a href={viewingUrl} download={viewingName}
                    className="btn btn-light btn-sm fw-medium">
                    ⬇️ Download
                  </a>
                  <button className="btn btn-light btn-sm"
                    onClick={() => setViewingUrl(null)}>✕</button>
                </div>
              </div>

              {/* Modal Body — Smart Viewer */}
              <div className="modal-body p-0" style={{ height: '82vh', background: '#2d2d2d' }}>
                {(() => {
                  const ext = viewingName.split('.').pop().toLowerCase();

                  // ✅ PDF — open in new tab (Cloudinary CORS blocks iframe)
                  if (ext === 'pdf') {
                    return (
                      <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white gap-4">
                        <div style={{ fontSize: '5rem' }}>📄</div>
                        <h5 className="fw-bold">{viewingName}</h5>
                        <p className="text-white-50 text-center px-4">
                          PDF មិនអាចបង្ហាញក្នុង iframe បានទេ<br/>
                          សូមប្រើប៊ូតុងខាងក្រោម
                        </p>
                        <div className="d-flex gap-3">
                          <a href={viewingUrl} target="_blank" rel="noreferrer"
                            className="btn btn-primary btn-lg px-4">
                            🔍 បើកក្នុង Tab ថ្មី
                          </a>
                          <a href={viewingUrl} download={viewingName}
                            className="btn btn-outline-light btn-lg px-4">
                            ⬇️ Download
                          </a>
                        </div>
                      </div>
                    );
                  }

                  // ✅ Word / Excel — Microsoft Office Online
                  if (['doc', 'docx', 'xls', 'xlsx'].includes(ext)) {
                    return (
                      <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(viewingUrl)}`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title={viewingName}
                      />
                    );
                  }

                  // ✅ Fallback
                  return (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white">
                      <div style={{ fontSize: '4rem' }}>📄</div>
                      <h5 className="mt-3">{viewingName}</h5>
                      <p className="text-white-50">មិនអាចបង្ហាញ preview បានទេ</p>
                      <div className="d-flex gap-3 mt-2">
                        <a href={viewingUrl} target="_blank" rel="noreferrer"
                          className="btn btn-primary">🔍 បើកក្នុង Tab ថ្មី</a>
                        <a href={viewingUrl} download={viewingName}
                          className="btn btn-outline-light">⬇️ Download</a>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GradeSubmission;