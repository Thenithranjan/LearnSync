import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import interventionService from '../../services/interventions/interventionService';
import interventionAnalyticsService from '../../services/interventions/interventionAnalyticsService';
import facultyAnalyticsService from '../../services/analytics/facultyAnalyticsService';
import ImprovementService from '../../services/interventions/improvementService';

import InterventionTable from '../../components/interventions/InterventionTable';
import InterventionCard from '../../components/interventions/InterventionCard';
import { Layers, Plus, RefreshCw, X, CheckCircle2, AlertTriangle, TrendingUp, Users } from 'lucide-react';

const FacultyInterventionsPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [interventions, setInterventions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review modal state
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewOutcome, setReviewOutcome] = useState('IMPROVED');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await facultyAnalyticsService.getFacultyOverview();
        const list = res.assignedCourses || [];
        setCourses(list);
        if (list.length > 0) setSelectedCourseId(list[0].courseId);
      } catch (err) {
        setError('Failed to load assigned courses.');
      }
    };
    fetchCourses();
  }, []);

  const loadData = async (page = 1) => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      setError('');
      const [listRes, analyticsRes] = await Promise.all([
        interventionService.getInterventions({ courseId: selectedCourseId, page, limit: 10 }),
        interventionAnalyticsService.getCourseAnalytics(selectedCourseId)
      ]);

      setInterventions(listRes.data || []);
      setPagination(listRes.pagination || { page: 1, limit: 10, totalPages: 1 });
      setAnalytics(analyticsRes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course interventions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [selectedCourseId]);

  const handleOpenReview = (item) => {
    setSelectedIntervention(item);
    setReviewNotes(item.facultyNotes || '');
    setReviewOutcome(item.outcome || 'IMPROVED');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIntervention) return;

    setSubmittingReview(true);
    try {
      await interventionService.reviewIntervention(selectedIntervention._id, {
        facultyNotes: reviewNotes,
        outcome: reviewOutcome
      });

      // Also trigger quantitative outcome delta evaluation
      try {
        await ImprovementService.evaluateOutcome(selectedIntervention._id);
      } catch (e) {
        console.warn('Delta eval warning:', e);
      }

      setSelectedIntervention(null);
      loadData(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Layers className="w-4 h-4" /> Academic Action Center
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">Faculty Intervention Management</h1>
            <p className="text-sm text-slate-400 mt-1">
              Track student support tasks, submit review outcomes, and evaluate concept score gains.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {courses.length > 0 && (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => loadData(pagination.page)}
              disabled={loading}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Analytics Summary Bar */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Course Tasks</span>
              <p className="text-2xl font-black text-slate-100">{analytics.totalInterventions}</p>
              <p className="text-[11px] text-slate-500">Support interventions created</p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Completed & Reviewed</span>
              <p className="text-2xl font-black text-indigo-400">
                {(analytics.statusSummary?.COMPLETED || 0) + (analytics.statusSummary?.REVIEWED || 0)}
              </p>
              <p className="text-[11px] text-indigo-300/80">Closed-loop tasks</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Successful Improvements</span>
              <p className="text-2xl font-black text-emerald-400">{analytics.successfulImprovements}</p>
              <p className="text-[11px] text-emerald-300/80">Positive concept score gains</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Observed Effectiveness</span>
              <p className="text-2xl font-black text-amber-400">
                {analytics.effectivenessRatio !== null ? `${analytics.effectivenessRatio}%` : 'N/A'}
              </p>
              <p className="text-[11px] text-amber-300/80">Measured improvement ratio</p>
            </div>
          </div>
        )}

        {/* Intervention Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Support Actions Roster</h3>
          </div>

          <InterventionTable
            interventions={interventions}
            pagination={pagination}
            onPageChange={(p) => loadData(p)}
            onReview={handleOpenReview}
            loading={loading}
          />
        </div>

        {/* Review Modal */}
        {selectedIntervention && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
              <button
                onClick={() => setSelectedIntervention(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Faculty Review</span>
                <h3 className="text-xl font-bold text-slate-100">{selectedIntervention.title}</h3>
                <p className="text-xs text-slate-400">
                  Student: <strong className="text-slate-200">{selectedIntervention.studentId?.name}</strong> • Topic: <strong className="text-slate-200">{selectedIntervention.topic}</strong>
                </p>
              </div>

              {selectedIntervention.studentResponse && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Student Reflection / Response:</span>
                  <p className="text-slate-200 italic">"{selectedIntervention.studentResponse}"</p>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Faculty Review Notes / Instructions
                  </label>
                  <textarea
                    rows="3"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter observations, recommendations, or mentoring outcome..."
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Intervention Outcome
                  </label>
                  <select
                    value={reviewOutcome}
                    onChange={(e) => setReviewOutcome(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IMPROVED">IMPROVED — Concept Mastery Closed</option>
                    <option value="PARTIALLY_IMPROVED">PARTIALLY IMPROVED — Progress Demonstrated</option>
                    <option value="NO_SIGNIFICANT_CHANGE">NO SIGNIFICANT CHANGE — Needs Review</option>
                    <option value="FURTHER_SUPPORT_REQUIRED">FURTHER SUPPORT REQUIRED — Follow-up Needed</option>
                    <option value="NOT_COMPLETED">NOT COMPLETED — Action Incomplete</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIntervention(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Save Review & Evaluate'}
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

export default FacultyInterventionsPage;
