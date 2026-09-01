import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import studentAnalyticsService from '../../services/analytics/studentAnalyticsService';
import PerformanceCard from '../../components/analytics/PerformanceCard';
import PerformanceTrendChart from '../../components/analytics/PerformanceTrendChart';
import CoursePerformanceChart from '../../components/analytics/CoursePerformanceChart';
import TopicPerformanceChart from '../../components/analytics/TopicPerformanceChart';
import {
  Award,
  FileText,
  HelpCircle,
  CalendarCheck,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const StudentAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [trends, setTrends] = useState({ labels: [], scores: [] });
  const [topics, setTopics] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const loadData = async (courseId = '') => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, coursesData, trendsData, topicsData] = await Promise.all([
        studentAnalyticsService.getOverview(courseId || null),
        studentAnalyticsService.getCourses(),
        studentAnalyticsService.getTrends(courseId || null),
        studentAnalyticsService.getTopics(courseId || null)
      ]);

      setOverview(overviewData);
      setCourses(coursesData || []);
      setTrends(trendsData || { labels: [], scores: [] });
      setTopics(topicsData || []);
    } catch (err) {
      console.error('Failed to load student analytics:', err);
      setError(err.message || 'Unable to load performance analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedCourseId);
  }, [selectedCourseId]);

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header with Title and Course Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              My Academic Performance
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Descriptive & diagnostic academic analytics derived from your coursework
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">All Enrolled Courses</option>
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.code ? `${c.code}: ` : ''}{c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => loadData(selectedCourseId)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="flex-1">
              <p className="font-semibold">Error Loading Performance Data</p>
              <p className="text-xs text-rose-400/90">{error}</p>
            </div>
            <button
              onClick={() => loadData(selectedCourseId)}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-900/40 rounded-2xl border border-slate-800" />
            ))}
          </div>
        )}

        {/* Metric KPI Cards (5 Standard Components + Overall Score) */}
        {!loading && overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <PerformanceCard
              title="Overall Score"
              value={overview.overallScore}
              subtitle="Weighted Aggregate"
              icon={Award}
              color="indigo"
              weightBadge="100%"
            />
            <PerformanceCard
              title="Assignments"
              value={overview.assignmentPerformance}
              subtitle={`${overview.metrics?.assignmentsSubmitted || 0}/${overview.metrics?.assignmentsTotal || 0} Graded`}
              icon={FileText}
              color="emerald"
              weightBadge="30%"
            />
            <PerformanceCard
              title="Quizzes"
              value={overview.quizPerformance}
              subtitle={`${overview.metrics?.quizzesAttempted || 0}/${overview.metrics?.quizzesTotal || 0} Completed`}
              icon={HelpCircle}
              color="cyan"
              weightBadge="30%"
            />
            <PerformanceCard
              title="Attendance"
              value={overview.attendance}
              subtitle={`${overview.metrics?.attendancePresentCount || 0}/${overview.metrics?.attendanceSessionsTotal || 0} Sessions`}
              icon={CalendarCheck}
              color="amber"
              weightBadge="20%"
            />
            <PerformanceCard
              title="Learning Progress"
              value={overview.learningProgress}
              subtitle={`${overview.metrics?.materialsCompleted || 0}/${overview.metrics?.materialsTotal || 0} Materials`}
              icon={BookOpen}
              color="violet"
              weightBadge="10%"
            />
            <PerformanceCard
              title="Engagement"
              value={overview.engagement}
              subtitle={`${overview.metrics?.forumPostsCount || 0} Forum Activity`}
              icon={MessageSquare}
              color="rose"
              weightBadge="10%"
            />
          </div>
        )}

        {/* Charts Grid: Trends & Topic Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assessment Performance Trend */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Performance Trend</h2>
                  <p className="text-xs text-slate-400">Score trajectory over recent assessments</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {trends.scores?.length || 0} Evaluated
              </span>
            </div>

            <PerformanceTrendChart
              labels={trends.labels || []}
              scores={trends.scores || []}
              height={240}
            />
          </div>

          {/* Topic Performance Breakdown */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Topic-wise Performance</h2>
                  <p className="text-xs text-slate-400">Concept accuracy breakdown</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {topics.length} Concepts
              </span>
            </div>

            <TopicPerformanceChart topics={topics} />
          </div>
        </div>

        {/* Course-Wise Performance Comparison */}
        {!selectedCourseId && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Enrolled Courses Performance</h2>
                  <p className="text-xs text-slate-400">Comparative standing across all enrolled subjects</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {courses.length} Courses
              </span>
            </div>

            <CoursePerformanceChart courses={courses} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StudentAnalyticsPage;
