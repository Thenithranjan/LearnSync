import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import assessmentService from '../../services/assessmentService';
import {
  ChevronLeft,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  Award,
  AlertCircle,
  Save
} from 'lucide-react';

const SubmissionsReviewPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Grading modal / inline state
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assessRes, subsRes] = await Promise.all([
        assessmentService.getAssessmentById(assessmentId),
        assessmentService.getAssessmentSubmissions(assessmentId)
      ]);

      if (assessRes?.success) setAssessment(assessRes.data);
      if (subsRes?.success) setSubmissions(subsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assessmentId) fetchData();
  }, [assessmentId]);

  const handleOpenGradeModal = (sub) => {
    setSelectedSub(sub);
    setGradeScore(sub.score !== undefined ? sub.score : '');
    setGradeFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    try {
      setGrading(true);
      const res = await assessmentService.gradeSubmission(selectedSub._id, {
        score: Number(gradeScore),
        feedback: gradeFeedback
      });

      if (res?.success) {
        setSelectedSub(null);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit grade.');
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-400 text-sm">Loading submissions list...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link
            to={`/courses/${assessment?.courseId?._id || assessment?.courseId}/assessments`}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Assessments
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-400" />
              Submission Review
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Review and grade submissions for: <span className="text-slate-200 font-medium">{assessment?.title}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-300">
              Total Submissions: {submissions.length}
            </span>
          </div>
        </div>

        {/* Submissions Table / Cards */}
        {submissions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No submissions yet</h3>
            <p className="text-slate-400 text-sm mt-1">Students have not turned in any work for this assessment yet.</p>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700/80">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Submitted At</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {submissions.map((sub) => {
                    const isGraded = sub.status === 'GRADED';
                    return (
                      <tr key={sub._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="font-semibold">{sub.studentId?.name || 'Unknown Student'}</div>
                          <div className="text-xs text-slate-400">{sub.studentId?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isGraded
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {isGraded ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-200">
                          {isGraded ? `${sub.score} / ${sub.totalPoints} (${sub.percentage}%)` : 'Pending'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenGradeModal(sub)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            {isGraded ? 'Edit Grade' : 'Grade Now'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grading Modal */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Grade Submission</h3>
                  <p className="text-xs text-slate-400">Student: {selectedSub.studentId?.name}</p>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Student Submission Content */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 max-h-48 overflow-y-auto text-xs sm:text-sm text-slate-300 space-y-3">
                <span className="font-bold text-slate-400 uppercase text-[11px] block">Student Response:</span>
                <p className="whitespace-pre-wrap">{selectedSub.content || 'No written response provided.'}</p>
                {selectedSub.attachmentUrl && (
                  <a
                    href={selectedSub.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-400 hover:underline pt-2 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Submitted Attachment Link
                  </a>
                )}
              </div>

              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Score (out of {selectedSub.totalPoints || 100})
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={selectedSub.totalPoints || 100}
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Instructor Feedback
                  </label>
                  <textarea
                    rows="3"
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for the student..."
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grading}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {grading ? 'Saving Grade...' : 'Save & Publish Grade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SubmissionsReviewPage;
