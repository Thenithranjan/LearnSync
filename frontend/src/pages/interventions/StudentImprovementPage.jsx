import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import improvementService from '../../services/interventions/improvementService';
import ImprovementCard from '../../components/interventions/ImprovementCard';
import { TrendingUp, Award, CheckCircle2, RefreshCw } from 'lucide-react';

const StudentImprovementPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await improvementService.getStudentImprovementHistory();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load improvement history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <TrendingUp className="w-4 h-4" /> Performance Gain Tracker
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">My Concept Gains & History</h1>
            <p className="text-sm text-slate-400 mt-1">
              Quantitative before-and-after accuracy comparisons demonstrating concept mastery growth.
            </p>
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Gains</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Evaluating post-action score deltas...</div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-300 text-sm font-semibold">
            {error}
          </div>
        ) : !data ? (
          <div className="py-16 text-center text-slate-500 text-xs">No improvement records.</div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Evaluated Actions</span>
                <p className="text-2xl font-black text-slate-100">{data.totalMeasuredInterventions}</p>
                <p className="text-[11px] text-slate-500">Measured support tasks</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Concepts Improved</span>
                <p className="text-2xl font-black text-emerald-400">{data.improvedTopicsCount}</p>
                <p className="text-[11px] text-emerald-300/80">Closed concept gaps</p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Mean Percentage Point Gain</span>
                <p className="text-2xl font-black text-indigo-400">
                  {data.averageImprovement > 0 ? `+${data.averageImprovement}%` : `${data.averageImprovement}%`}
                </p>
                <p className="text-[11px] text-indigo-300/80">Average topic score growth</p>
              </div>
            </div>

            {/* Improvement History Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-100">Before & After Topic Evaluations</h3>

              {data.history?.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800 text-center text-slate-400 text-xs">
                  No post-action evaluation data available yet. Complete support tasks and attempt new assessments to measure score gains!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.history.map((outcome) => (
                    <ImprovementCard key={outcome._id} outcome={outcome} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentImprovementPage;
