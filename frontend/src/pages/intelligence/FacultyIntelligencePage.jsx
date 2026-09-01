import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import facultyIntelligenceService from '../../services/intelligence/facultyIntelligenceService';
import facultyAnalyticsService from '../../services/analytics/facultyAnalyticsService';
import EarlyWarningTable from '../../components/intelligence/EarlyWarningTable';
import RiskFactors from '../../components/intelligence/RiskFactors';
import LearningGapCard from '../../components/intelligence/LearningGapCard';
import { ShieldAlert, AlertTriangle, Users, BookOpen, Brain, RefreshCw, X } from 'lucide-react';

const FacultyIntelligencePage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [warningData, setWarningData] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load faculty courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await facultyAnalyticsService.getFacultyOverview();
        const courseList = res.assignedCourses || [];
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0].courseId);
        }
      } catch (err) {
        setError('Failed to load faculty courses.');
      }
    };
    fetchCourses();
  }, []);

  // Load intelligence for selected course
  const fetchCourseIntelligence = async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      setError('');
      setSelectedStudentDetail(null);
      const [warnRes, topRes] = await Promise.all([
        facultyIntelligenceService.getCourseEarlyWarning(selectedCourseId),
        facultyIntelligenceService.getCourseTopics(selectedCourseId)
      ]);
      setWarningData(warnRes);
      setTopicData(topRes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseIntelligence();
  }, [selectedCourseId]);

  const handleDiagnoseStudent = async (student) => {
    try {
      setLoadingDetail(true);
      const res = await facultyIntelligenceService.getStudentRiskDetail(selectedCourseId, student.studentId);
      setSelectedStudentDetail({ student, ...res });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Brain className="w-4 h-4" /> Academic Intelligence Center
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">Faculty Early Warning & Insights</h1>
            <p className="text-sm text-slate-400 mt-1">
              Identify struggling students early, detect common class bottlenecks, and deliver targeted academic interventions.
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
              onClick={fetchCourseIntelligence}
              disabled={loading}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Brain className="w-10 h-10 text-indigo-400 animate-pulse mx-auto" />
            <p className="text-sm text-slate-300 font-medium">Synthesizing course diagnostic intelligence...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-300 text-sm font-semibold">
            {error}
          </div>
        ) : !warningData ? (
          <div className="py-16 text-center text-slate-500">No course data available.</div>
        ) : (
          <div className="space-y-8">
            {/* Risk Distribution Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Enrolled</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-2xl font-black text-slate-100">{warningData.totalStudents}</p>
                <p className="text-[11px] text-slate-500">Active class roster</p>
              </div>

              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between text-rose-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Critical / High Risk</span>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-rose-400">
                  {(warningData.riskSummary?.CRITICAL || 0) + (warningData.riskSummary?.HIGH || 0)}
                </p>
                <p className="text-[11px] text-rose-300/80">Require immediate faculty check-in</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Moderate Risk</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black text-amber-400">
                  {warningData.riskSummary?.MODERATE || 0}
                </p>
                <p className="text-[11px] text-amber-300/80">Benefit from targeted practice</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Class Attention Topics</span>
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-black text-slate-100">
                  {topicData?.attentionAreas?.length || 0}
                </p>
                <p className="text-[11px] text-slate-500">Concepts with class average &lt;60%</p>
              </div>
            </div>

            {/* Class-level Concept Bottlenecks */}
            {topicData?.attentionAreas?.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Class Attention Topics</h3>
                  <p className="text-xs text-slate-400">
                    Topics where student accuracy is lowest across the class. Consider allocating classroom time for these concepts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topicData.attentionAreas.map((area, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{area.topic}</span>
                        <span className="text-xs font-bold text-rose-400">{area.averageAccuracy}% Avg</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {area.questionsAttempted} cumulative student questions evaluated.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Early Warning Table */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Early Warning Roster</h3>
                <p className="text-xs text-slate-400">
                  Students flagged based on multi-component risk indicators, attendance deficits, or declining assessment trajectories.
                </p>
              </div>

              <EarlyWarningTable
                students={warningData.earlyWarnings}
                onSelectStudent={handleDiagnoseStudent}
              />
            </div>

            {/* Diagnostic Drawer / Modal for Selected Student */}
            {selectedStudentDetail && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Student Deep Dive</span>
                    <h3 className="text-xl font-bold text-slate-100">{selectedStudentDetail.student.name}</h3>
                    <p className="text-xs text-slate-400">{selectedStudentDetail.student.email} • {selectedStudentDetail.student.department}</p>
                  </div>
                  <button
                    onClick={() => setSelectedStudentDetail(null)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Suggested Faculty Actions */}
                {selectedStudentDetail.student.suggestedActions?.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Suggested Faculty Actions</h4>
                    <ul className="space-y-1.5 pl-2">
                      {selectedStudentDetail.student.suggestedActions.map((act, i) => (
                        <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Factors */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk Factor Attribution</h4>
                  <RiskFactors
                    factors={selectedStudentDetail.risk?.factors}
                    explanation={selectedStudentDetail.risk?.explanation}
                  />
                </div>

                {/* Learning Gaps */}
                {selectedStudentDetail.gaps?.attentionTopics?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Concept Gaps</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedStudentDetail.gaps.attentionTopics.map((g, i) => (
                        <LearningGapCard key={i} gap={g} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FacultyIntelligencePage;
