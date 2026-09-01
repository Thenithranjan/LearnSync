import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import assessmentService from '../../services/assessmentService';
import {
  FileText,
  Calendar,
  Clock,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Send,
  MessageSquare,
  Award
} from 'lucide-react';

const AssignmentSubmissionPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Submission form state
  const [content, setContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchAssignmentAndSubmission = async () => {
      try {
        setLoading(true);
        const [assignRes, subRes] = await Promise.all([
          assessmentService.getAssessmentById(assessmentId),
          assessmentService.getMySubmission(assessmentId).catch(() => null)
        ]);

        if (assignRes?.success) {
          setAssignment(assignRes.data);
        }

        if (subRes?.success && subRes.data) {
          setSubmission(subRes.data);
          setContent(subRes.data.content || '');
          setAttachmentUrl(subRes.data.attachmentUrl || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssignmentAndSubmission();
    }
  }, [assessmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !attachmentUrl.trim()) {
      setError('Please provide written content or an attachment link.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await assessmentService.submitAssessment(assessmentId, {
        content,
        attachmentUrl
      });

      if (res?.success) {
        setSubmission(res.data);
        setSuccessMsg('Assignment submitted successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-400 text-sm">Loading assignment details...</span>
        </div>
      </MainLayout>
    );
  }

  if (error && !assignment) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto my-12 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white">Assignment Unavailable</h2>
          <p className="text-sm text-rose-300 mt-1">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 text-sm rounded-lg hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  const isGraded = submission?.status === 'GRADED';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link
            to={`/courses/${assignment.courseId?._id || assignment.courseId}/assessments`}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Assessments
          </Link>
        </div>

        {/* Assignment Brief */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-3.5 h-3.5" /> ASSIGNMENT
            </span>
            <span className="text-sm font-bold text-slate-300">
              {assignment.totalPoints} Total Points
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{assignment.title}</h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {assignment.dueDate && (
              <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Due Date: {new Date(assignment.dueDate).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Passing: {assignment.passingScore}%</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-sm text-slate-300 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Instructions</h4>
            <p className="whitespace-pre-wrap leading-relaxed">
              {assignment.instructions || assignment.description || 'No special instructions provided.'}
            </p>
          </div>
        </div>

        {/* Grade Feedback Box if Graded */}
        {isGraded && (
          <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Award className="w-5 h-5" />
                <span>Instructor Grade & Feedback</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  submission.isPassed
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {submission.isPassed ? 'PASSED' : 'NEEDS REVISION'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-white">{submission.score}</span>
              <span className="text-slate-400 text-sm">/ {submission.totalPoints} pts ({submission.percentage}%)</span>
            </div>

            {submission.feedback && (
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="italic">"{submission.feedback}"</p>
              </div>
            )}
          </div>
        )}

        {/* Submission Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-400" />
              {submission ? 'Your Submission' : 'Submit Assignment'}
            </h3>
            {submission && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" /> Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-5 h-5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Written Response / Solution Notes
              </label>
              <textarea
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isGraded}
                placeholder="Type or paste your assignment solution, code snippet, or write-up here..."
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Attachment Link (Google Drive, GitHub repo, PDF URL)
              </label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                disabled={isGraded}
                placeholder="https://github.com/... or https://drive.google.com/..."
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
              />
            </div>

            {!isGraded && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Assignment'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AssignmentSubmissionPage;
