import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import interventionAnalyticsService from '../../services/interventions/interventionAnalyticsService';
import { Layers, ShieldAlert, CheckCircle2, TrendingUp, Users, RefreshCw } from 'lucide-react';

const AdminInterventionsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await interventionAnalyticsService.getAdminAnalytics();
      setAnalytics(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load institution intervention analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Layers className="w-4 h-4" /> Campus Action Intelligence
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">Institution Intervention Analytics</h1>
            <p className="text-sm text-slate-400 mt-1">
              Campus-wide academic support tasks, closed-loop resolution rates, and systemic improvement ratios.
            </p>
          </div>

          <button
            onClick={fetchAdminAnalytics}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Aggregating campus-wide intervention data...</div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-300 text-sm font-semibold">
            {error}
          </div>
        ) : !analytics ? (
          <div className="py-16 text-center text-slate-500 text-xs">No analytics available.</div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Campus Interventions</span>
                <p className="text-2xl font-black text-slate-100">{analytics.totalInterventions}</p>
                <p className="text-[11px] text-slate-500">Total created actions</p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Measured Outcomes</span>
                <p className="text-2xl font-black text-indigo-400">{analytics.totalMeasured}</p>
                <p className="text-[11px] text-indigo-300/80">Evaluated post-action score deltas</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Campus Effectiveness</span>
                <p className="text-2xl font-black text-emerald-400">
                  {analytics.overallEffectiveness !== null ? `${analytics.overallEffectiveness}%` : 'N/A'}
                </p>
                <p className="text-[11px] text-emerald-300/80">Overall positive gain ratio</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Reviewed Actions</span>
                <p className="text-2xl font-black text-amber-400">{analytics.statusSummary?.REVIEWED || 0}</p>
                <p className="text-[11px] text-amber-300/80">Faculty reviewed & closed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminInterventionsPage;
