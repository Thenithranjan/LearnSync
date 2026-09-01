import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import studentIntelligenceService from '../../services/intelligence/studentIntelligenceService';
import recommendationService from '../../services/intelligence/recommendationService';
import RiskIndicator from '../../components/intelligence/RiskIndicator';
import RiskFactors from '../../components/intelligence/RiskFactors';
import LearningGapCard from '../../components/intelligence/LearningGapCard';
import RecommendationCard from '../../components/intelligence/RecommendationCard';
import TopicInsights from '../../components/intelligence/TopicInsights';
import { Sparkles, Brain, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const StudentIntelligencePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await studentIntelligenceService.getOverview();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to analyze academic intelligence data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleCompleteRec = async (id) => {
    try {
      await recommendationService.completeRecommendation(id);
      setActionSuccess('Recommendation marked as completed! Keep up the momentum.');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchInsights();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissRec = async (id) => {
    try {
      await recommendationService.dismissRecommendation(id);
      fetchInsights();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" /> Academic Intelligence Engine
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">My Learning Insights</h1>
            <p className="text-sm text-slate-400 mt-1">
              Evidence-based diagnostics, concept gaps, and personalized study recommendations.
            </p>
          </div>

          <button
            onClick={fetchInsights}
            disabled={loading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {actionSuccess}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Brain className="w-10 h-10 text-indigo-400 animate-pulse mx-auto" />
            <p className="text-sm text-slate-300 font-medium">Analyzing your learning data and concept mastery...</p>
            <p className="text-xs text-slate-500">Evaluating multi-module quiz results, trends, and course materials.</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm text-rose-300 font-semibold">{error}</p>
            <button
              onClick={fetchInsights}
              className="px-4 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition-colors mt-2"
            >
              Retry
            </button>
          </div>
        ) : !data ? (
          <div className="py-16 text-center text-slate-500">No learning intelligence available.</div>
        ) : (
          <div className="space-y-8">
            {/* Top Row: Risk Gauge & Factor Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <RiskIndicator
                  riskScore={data.risk?.riskScore}
                  riskLevel={data.risk?.riskLevel}
                  trend={data.trend}
                />

                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mastery Snapshot</h4>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-2xl font-black text-slate-100">
                      {data.overallPerformance !== null ? `${data.overallPerformance}%` : 'N/A'}
                    </span>
                    <span className="text-xs text-indigo-400 font-medium">5-Module Weighted GPA</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Combined score across assignments, quizzes, attendance, syllabus progress, and forums.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">Why this Risk Level?</h3>
                  <span className="text-xs text-slate-400 font-medium">Factor Attribution</span>
                </div>
                <RiskFactors
                  factors={data.risk?.factors}
                  explanation={data.risk?.explanation}
                />
              </div>
            </div>

            {/* Personalized Recommendations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Recommended For You</h3>
                  <p className="text-xs text-slate-400">Targeted review and practice based on identified concept gaps.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {data.recommendations?.length || 0} Actions Active
                </span>
              </div>

              {data.recommendations?.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800 text-center text-slate-400 text-xs">
                  🎉 Great job! No remedial recommendations needed at this time. Keep excelling!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.recommendations.map((rec) => (
                    <RecommendationCard
                      key={rec._id}
                      recommendation={rec}
                      onComplete={handleCompleteRec}
                      onDismiss={handleDismissRec}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Learning Gaps Detail */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Topics Requiring Attention</h3>
                <p className="text-xs text-slate-400">Evidence-based concept diagnostics with detailed test accuracy.</p>
              </div>

              {data.attentionTopics?.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 text-center text-slate-400 text-xs">
                  ✅ No severe concept gaps detected. Your topic accuracies meet or exceed developing standards.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.attentionTopics.map((gap, i) => (
                    <LearningGapCard key={i} gap={gap} />
                  ))}
                </div>
              )}
            </div>

            {/* 3-Tier Topic Mastery */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Concept Mastery Breakdown</h3>
                <p className="text-xs text-slate-400">Categorized topic competencies across enrolled subjects.</p>
              </div>
              <TopicInsights
                strongTopics={data.strongTopics}
                developingTopics={data.developingTopics}
                attentionTopics={data.attentionTopics}
              />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentIntelligencePage;
