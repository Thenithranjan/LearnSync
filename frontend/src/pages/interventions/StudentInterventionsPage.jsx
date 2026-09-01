import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import interventionService from '../../services/interventions/interventionService';
import InterventionCard from '../../components/interventions/InterventionCard';
import { ShieldAlert, CheckCircle2, Clock, PlayCircle, Layers, RefreshCw } from 'lucide-react';

const StudentInterventionsPage = () => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await interventionService.getInterventions();
      setInterventions(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load support actions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await interventionService.acknowledgeIntervention(id);
      fetchInterventions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStart = async (id) => {
    try {
      await interventionService.startIntervention(id);
      fetchInterventions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id, studentResponse) => {
    try {
      await interventionService.completeIntervention(id, studentResponse);
      fetchInterventions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = interventions.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Layers className="w-4 h-4" /> Academic Action Layer
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">My Support Actions</h1>
            <p className="text-sm text-slate-400 mt-1">
              Track personalized practice tasks, doubt sessions, and faculty study recommendations.
            </p>
          </div>

          <button
            onClick={fetchInterventions}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Tasks</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === st
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading support tasks...</div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-300 text-sm font-semibold">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No support tasks found under this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <InterventionCard
                key={item._id}
                intervention={item}
                userRole="STUDENT"
                onAcknowledge={handleAcknowledge}
                onStart={handleStart}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentInterventionsPage;
