import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import facultyAnalyticsService from '../../services/analytics/facultyAnalyticsService';
import PerformanceCard from '../../components/analytics/PerformanceCard';
import PerformanceTrendChart from '../../components/analytics/PerformanceTrendChart';
import PerformanceDistributionChart from '../../components/analytics/PerformanceDistributionChart';
import TopicPerformanceChart from '../../components/analytics/TopicPerformanceChart';
import StudentPerformanceTable from '../../components/analytics/StudentPerformanceTable';
import {
  Users,
  Award,
  CalendarCheck,
  HelpCircle,
  FileText,
  BookOpen,
  TrendingUp,
  BarChart2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const FacultyAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facultyOverview, setFacultyOverview] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Course-specific analytics states
  const [courseTrends, setCourseTrends] = useState({ labels: [], scores: [] });
  const [courseDistribution, setCourseDistribution] = useState({});
  const [courseTopics, setCourseTopics] = useState([]);
  const [studentData, setStudentData] = useState({ students: [], totalEnrolled: 0 });

  const [sortBy, setSortBy] = useState('overallScore');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadFacultyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await facultyAnalyticsService.getOverview();
      setFacultyOverview(overview);

      // Auto-select first course if available and none currently selected
      if (overview.courses && overview.courses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(overview.courses[0].courseId);
      }
    } catch (err) {
      console.error('Failed to load faculty analytics overview:', err);
      setError(err.message || 'Unable to load faculty analytics.');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (courseId, sortField = sortBy, sortDir = sortOrder) => {
    if (!courseId) return;
    try {
      const [trends, distribution, topics, students] = await Promise.all([
        facultyAnalyticsService.getCourseTrends(courseId),
        facultyAnalyticsService.getCourseDistribution(courseId),
        facultyAnalyticsService.getCourseTopics(courseId),
        facultyAnalyticsService.getCourseStudents(courseId, { sortBy: sortField, sortOrder: sortDir })
      ]);

      setCourseTrends(trends || { labels: [], scores: [] });
      setCourseDistribution(distribution?.distribution || {});
      setCourseTopics(topics || []);
      setStudentData(students || { students: [], totalEnrolled: 0 });
    } catch (err) {
      console.error('Failed to load course details analytics:', err);
      setError(err.message || 'Unable to load course analytics.');
    }
  };

  useEffect(() => {
    loadFacultyData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseData(selectedCourseId, sortBy, sortOrder);
    }
  }, [selectedCourseId, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const selectedCourseSummary = facultyOverview?.courses?.find(
    (c) => c.courseId === selectedCourseId
  );

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header and Course Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent">
              Faculty Course Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Class-level diagnostic and performance metrics across assigned courses
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {facultyOverview?.courses && facultyOverview.courses.length > 0 && (
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full sm:w-72 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {facultyOverview.courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.code ? `${c.code}: ` : ''}{c.title}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => {
                loadFacultyData();
                if (selectedCourseId) loadCourseData(selectedCourseId);
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="flex-1">
              <p className="font-semibold">Error Loading Course Analytics</p>
              <p className="text-xs text-rose-400/90">{error}</p>
            </div>
            <button
              onClick={loadFacultyData}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Class KPI Cards */}
        {selectedCourseSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <PerformanceCard
              title="Enrolled Students"
              value={selectedCourseSummary.totalEnrolled}
              subtitle="Active Learners"
              icon={Users}
              color="indigo"
              suffix=""
            />
            <PerformanceCard
              title="Class Average"
              value={selectedCourseSummary.averagePerformance}
              subtitle="Overall Weighted"
              icon={Award}
              color="emerald"
            />
            <PerformanceCard
              title="Avg Attendance"
              value={selectedCourseSummary.averageAttendance}
              subtitle="Session Check-ins"
              icon={CalendarCheck}
              color="amber"
            />
            <PerformanceCard
              title="Avg Quiz Score"
              value={selectedCourseSummary.averageQuizScore}
              subtitle="Concept Mastery"
              icon={HelpCircle}
              color="cyan"
            />
            <PerformanceCard
              title="Avg Assignment"
              value={selectedCourseSummary.averageAssignment}
              subtitle="Practical Work"
              icon={FileText}
              color="violet"
            />
            <PerformanceCard
              title="Avg Progress"
              value={selectedCourseSummary.averageProgress}
              subtitle="Material Coverage"
              icon={BookOpen}
              color="rose"
            />
          </div>
        )}

        {/* Visual Charts: Distribution & Assessment Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Distribution */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100">Performance Distribution</h2>
                <p className="text-xs text-slate-400">Student score histogram across grade brackets</p>
              </div>
            </div>

            <PerformanceDistributionChart
              distribution={courseDistribution}
              totalStudents={studentData.totalEnrolled}
            />
          </div>

          {/* Class Assessment Performance Trend */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100">Class Performance Trend</h2>
                <p className="text-xs text-slate-400">Class average across consecutive assessments</p>
              </div>
            </div>

            <PerformanceTrendChart
              labels={courseTrends.labels || []}
              scores={courseTrends.scores || []}
              height={240}
            />
          </div>
        </div>

        {/* Class Topic Performance */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100">Class Topic Performance</h2>
                <p className="text-xs text-slate-400">Aggregated concept accuracy across all student quiz submissions</p>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {courseTopics.length} Topics
            </span>
          </div>

          <TopicPerformanceChart topics={courseTopics} />
        </div>

        {/* Student Performance Sortable Table */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Student Performance Breakdown</h2>
              <p className="text-xs text-slate-400">Individual student scores and metric indicators</p>
            </div>
          </div>

          <StudentPerformanceTable
            students={studentData.students || []}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default FacultyAnalyticsPage;
