import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import adminAnalyticsService from '../../services/analytics/adminAnalyticsService';
import PerformanceCard from '../../components/analytics/PerformanceCard';
import CoursePerformanceChart from '../../components/analytics/CoursePerformanceChart';
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  CalendarCheck,
  Building2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const AdminAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [departments, setDepartments] = useState([]);

  const loadAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, deptsData] = await Promise.all([
        adminAnalyticsService.getOverview(),
        adminAnalyticsService.getDepartments()
      ]);

      setOverview(overviewData);
      setDepartments(deptsData || []);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError(err.message || 'Unable to load institution analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-rose-300 bg-clip-text text-transparent">
              Institution Performance Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              High-level institution and department academic metrics
            </p>
          </div>

          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="flex-1">
              <p className="font-semibold">Error Loading Institution Analytics</p>
              <p className="text-xs text-rose-400/90">{error}</p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Institution KPI Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <PerformanceCard
              title="Total Students"
              value={overview.totalStudents}
              subtitle="Registered Learners"
              icon={GraduationCap}
              color="indigo"
              suffix=""
            />
            <PerformanceCard
              title="Total Faculty"
              value={overview.totalFaculty}
              subtitle="Teaching Staff"
              icon={Users}
              color="amber"
              suffix=""
            />
            <PerformanceCard
              title="Active Courses"
              value={overview.totalCourses}
              subtitle="Curriculum Offerings"
              icon={BookOpen}
              color="cyan"
              suffix=""
            />
            <PerformanceCard
              title="Avg Performance"
              value={overview.averagePerformance}
              subtitle="Institution-wide GPA"
              icon={Award}
              color="emerald"
            />
            <PerformanceCard
              title="Avg Attendance"
              value={overview.averageAttendance}
              subtitle="Campus-wide Presence"
              icon={CalendarCheck}
              color="rose"
            />
          </div>
        )}

        {/* Department-Wise Performance Grid */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Department Performance Summary</h2>
              <p className="text-xs text-slate-400">Comparative standing across academic departments</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {departments.map((dept, idx) => (
              <div
                key={dept.department || idx}
                className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100 text-sm">{dept.department}</h3>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    {dept.averagePerformance !== null ? `${dept.averagePerformance}%` : 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-semibold">Students</span>
                    <strong className="text-slate-200">{dept.studentCount}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-500 font-semibold">Courses</span>
                    <strong className="text-slate-200">{dept.courseCount}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-800">
                    <span className="block text-[10px] uppercase text-slate-500 font-semibold">Attendance</span>
                    <strong className="text-slate-200">
                      {dept.averageAttendance !== null ? `${dept.averageAttendance}%` : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institution Course Performance List */}
        {overview?.courses && (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100">Course Offerings Performance</h2>
                <p className="text-xs text-slate-400">Class averages across active curriculum</p>
              </div>
            </div>

            <CoursePerformanceChart courses={overview.courses} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminAnalyticsPage;
