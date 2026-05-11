import { useState, useEffect } from 'react';
import assignmentService from '../../services/assignmentService';

const GradeSubmission = ({ assignmentId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const res = await assignmentService.getSubmissions(assignmentId);

      setData(res.data);
    } catch (error) {
      console.error(error);
      alert('មានបញ្ហាក្នុងការទាញទិន្នន័យ!');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (submissionId, field, value) => {
    setGrading((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  };

  const handleGradeSubmit = async (submissionId) => {
    const current = grading[submissionId] || {};

    const grade =
      current.grade !== undefined
        ? current.grade
        : data.submissions.find((s) => s.id === submissionId)?.grade;

    const feedback =
      current.feedback !== undefined
        ? current.feedback
        : data.submissions.find((s) => s.id === submissionId)?.feedback;

    if (grade === '' || grade === undefined || grade === null) {
      return alert('សូមបញ្ចូលពិន្ទុ!');
    }

    try {
      await assignmentService.gradeSubmission(
        submissionId,
        grade,
        feedback
      );

      alert('ដាក់ពិន្ទុដោយជោគជ័យ!');

      fetchSubmissions();
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || 'មានបញ្ហា!');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        កំពុងទាញទិន្នន័យ...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-red-500">
        រកមិនឃើញទិន្នន័យ!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {data.assignment.title}
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          ការដាក់ស្នាដៃសរុប៖{' '}
          <span className="font-semibold text-blue-600">
            {data.totalSubmissions}
          </span>
        </p>
      </div>

      {/* Empty */}
      {data.submissions.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          មិនទាន់មានការដាក់ស្នាដៃ
        </div>
      ) : (
        <div className="space-y-5">
          {data.submissions.map((sub) => (
            <div
              key={sub.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              {/* Student Info */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {sub.student?.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {sub.student?.email}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium w-fit ${
                    sub.status === 'graded'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {sub.status === 'graded'
                    ? '✅ បានដាក់ពិន្ទុ'
                    : '⏳ រង់ចាំ'}
                </span>
              </div>

              {/* File Link */}
              <div className="mb-4">
                <a
                  href={sub.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline text-sm"
                >
                  📄 {sub.fileName || 'មើលឯកសារ'}
                </a>
              </div>

              {/* Grade Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    ពិន្ទុ / {data.assignment.totalPoints}
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={data.assignment.totalPoints}
                    defaultValue={sub.grade || ''}
                    onChange={(e) =>
                      handleGradeChange(
                        sub.id,
                        'grade',
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="បញ្ចូលពិន្ទុ"
                  />
                </div>

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    មតិកែលម្អ
                  </label>

                  <input
                    type="text"
                    defaultValue={sub.feedback || ''}
                    onChange={(e) =>
                      handleGradeChange(
                        sub.id,
                        'feedback',
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="សរសេរមតិ..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-5">
                <button
                  onClick={() => handleGradeSubmit(sub.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
                >
                  💾 រក្សាទុកពិន្ទុ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradeSubmission;