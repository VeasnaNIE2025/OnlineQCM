import { useState, useEffect, useRef } from 'react';
import assignmentService from '../../services/assignmentService';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [uploading, setUploading]     = useState(null); // assignmentId
  const fileRefs                      = useRef({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await assignmentService.getStudentAssignments();
      setAssignments(res.data.assignments);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (assignmentId) => {
    const file = fileRefs.current[assignmentId]?.files[0];
    if (!file) return alert('សូមជ្រើសរើសឯកសារ!');

    setUploading(assignmentId);
    try {
      await assignmentService.submitAssignment(assignmentId, file);
      alert('ដាក់ស្នាដៃដោយជោគជ័យ!');
      fetchAssignments();
    } catch (error) {
      alert(error.response?.data?.message || 'មានបញ្ហា!');
    } finally {
      setUploading(null);
    }
  };

  const isOverdue = (dueDate) => new Date() > new Date(dueDate);

  if (loading) return <div className="text-center py-8">កំពុងទាញទិន្នន័យ...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">កិច្ចការរបស់ខ្ញុំ</h2>

      {assignments.length === 0 ? (
        <p className="text-center text-gray-400 py-8">មិនទាន់មានកិច្ចការ</p>
      ) : (
        assignments.map(assignment => {
          const submitted = assignment.Submissions?.length > 0;
          const overdue   = isOverdue(assignment.dueDate);

          return (
            <div key={assignment.id} className="bg-white rounded-xl shadow p-5">

              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                  <p className="text-sm text-blue-600">{assignment.Subject?.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  submitted
                    ? 'bg-green-100 text-green-700'
                    : overdue
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {submitted ? '✅ បានដាក់' : overdue ? '❌ ផុតកំណត់' : '⏳ រង់ចាំ'}
                </span>
              </div>

              {/* Description */}
              {assignment.description && (
                <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
              )}

              {/* Info */}
              <div className="flex gap-4 text-xs text-gray-500 mb-4">
                <span>📅 {new Date(assignment.dueDate).toLocaleString('km-KH')}</span>
                <span>⭐ {assignment.totalPoints} ពិន្ទុ</span>
              </div>

              {/* Upload — បង្ហាញតែពេលមិនទាន់ submit */}
              {!submitted && !overdue && (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    ref={el => fileRefs.current[assignment.id] = el}
                    className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    onClick={() => handleUpload(assignment.id)}
                    disabled={uploading === assignment.id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                  >
                    {uploading === assignment.id ? 'កំពុង Upload...' : '📤 ដាក់ស្នាដៃ'}
                  </button>
                </div>
              )}

              {/* Grade Result */}
              {submitted && assignment.Submissions[0].status === 'graded' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                  <p className="text-sm font-medium text-green-800">
                    ពិន្ទុ៖ {assignment.Submissions[0].grade} / {assignment.totalPoints}
                  </p>
                  {assignment.Submissions[0].feedback && (
                    <p className="text-sm text-green-700 mt-1">
                      មតិ៖ {assignment.Submissions[0].feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default AssignmentList;