import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import adminIntelligenceService from '../../services/intelligence/adminIntelligenceService';
import { ShieldAlert, AlertTriangle, Users, Brain, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

const AdminIntelligencePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminIntelligence = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminIntelligenceService.getOverview();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load institution intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminIntelligence();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Brain className="w-4 h-4" /> Campus-Wide Intelligence
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">Institution Academic Intelligence</h1>
            <p className="text-sm text-slate-400 mt-1">
              Holistic campus risk distributions, bottleneck concepts, and systemic learning trends.
            </p>
          </div>

          <button
            onClick={fetchAdminIntelligence}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Overview</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Brain className="w-10 h-10 text-indigo-400 animate-pulse mx-auto" />
            <p className="text-sm text-slate-300 font-medium">Aggregating campus-wide intelligence metrics...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-300 text-sm font-semibold">
            {error}
          </div>
        ) : !data ? (
          <div className="py-16 text-center text-slate-500">No institution intelligence available.</div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Evaluated Students</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-slate-100">{data.totalStudents}</p>
                <p className="text-[11px] text-slate-500">Active student body</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Average Risk Index</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-black text-slate-100">
                  {data.averageRiskScore !== null ? `${data.averageRiskScore}/100` : 'N/A'}
                </p>
                <p className="text-[11px] text-slate-500">Campus-wide mean</p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between text-rose-400">
                  <span className="text-xs font-bold uppercase tracking-wider">High / Critical Risk</span>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-rose-400">
                  {(data.riskSummary?.CRITICAL || 0) + (data.riskSummary?.HIGH || 0)}
                </p>
                <p className="text-[11px] text-rose-300/80">Support prioritization</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Moderate Risk</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-amber-400">
                  {data.riskSummary?.MODERATE || 0}
                </p>
                <p className="text-[11px] text-amber-300/80">Developing academic trajectory</p>
              </div>
            </div>

            {/* Campus Common Bottleneck Concepts */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Systemic Academic Bottlenecks</h3>
                <p className="text-xs text-slate-400">
                  Topics with lowest student accuracy across all published courses and departments.
                </p>
              </div>

              {data.commonAttentionTopics?.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No systemic cross-course concept bottlenecks identified yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.commonAttentionTopics.map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{item.topic}</span>
                        <span className="text-xs font-bold text-rose-400">{item.averageAccuracy}%</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>{item.coursesAffected} Courses</span>
                        <span>{item.totalQuestions} Questions</span>
                      </div>
                    </div>
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

export default AdminIntelligencePage;
