import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import { testRoleApi } from '../services/userService';
import {
  GraduationCap,
  Shield,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  BarChart2,
  AlertTriangle,
  UserCheck,
  Brain,
  MessageSquare,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const handleTestRole = async (targetRole) => {
    setTestLoading(true);
    setTestResult(null);

    try {
      const data = await testRoleApi(targetRole);
      setTestResult({
        success: true,
        endpoint: `/api/${targetRole.toLowerCase()}/test`,
        message: data.message || `Access Granted. Role ${user?.role} is authorized.`,
        data: data,
        status: 200
      });
    } catch (err) {
      setTestResult({
        success: false,
        endpoint: `/api/${targetRole.toLowerCase()}/test`,
        targetRole,
        message: err.message || `Access correctly blocked for role ${user?.role}.`,
        status: err.status || 403
      });
    } finally {
      setTestLoading(false);
    }
  };

  const renderRoleDashboardHeader = () => {
    switch (user?.role) {
      case 'ADMIN':
        return (
          <div className="bg-gradient-to-r from-rose-900/30 via-slate-900 to-slate-900 p-6 rounded-2xl border border-rose-500/20 shadow-xl mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-2">
                  <Shield className="w-3.5 h-3.5" /> Institution Management
                </div>
                <h1 className="text-3xl font-extrabold text-white">Admin Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Welcome back, <span className="text-slate-200 font-medium">{user?.name}</span>. You have full institution-level privileges.
                </p>
              </div>
              <div className="px-4 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                Department: <span className="text-rose-300 font-semibold">{user?.department || 'Central Administration'}</span>
              </div>
            </div>
          </div>
        );

      case 'FACULTY':
        return (
          <div className="bg-gradient-to-r from-amber-900/30 via-slate-900 to-slate-900 p-6 rounded-2xl border border-amber-500/20 shadow-xl mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
                  <BookOpen className="w-3.5 h-3.5" /> Academic & Teaching Hub
                </div>
                <h1 className="text-3xl font-extrabold text-white">Faculty Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Welcome back, <span className="text-slate-200 font-medium">{user?.name}</span>. Manage your course delivery and student engagements.
                </p>
              </div>
              <div className="px-4 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                Department: <span className="text-amber-300 font-semibold">{user?.department || 'Faculty Office'}</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 mb-2">
                  <Award className="w-3.5 h-3.5" /> Student Workspace
                </div>
                <h1 className="text-3xl font-extrabold text-white">Student Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">
                  Welcome back, <span className="text-slate-200 font-medium">{user?.name}</span>. Track your digital learning and performance insights.
                </p>
              </div>
              <div className="px-4 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
                Department: <span className="text-indigo-300 font-semibold">{user?.department || 'General Studies'}</span>
              </div>
            </div>
          </div>
        );
    }
  };

  const getCourseLink = () => {
    if (user?.role === 'FACULTY') return '/faculty/courses';
    if (user?.role === 'ADMIN') return '/admin/courses';
    return '/my-courses';
  };

  const getAnalyticsLink = () => {
    if (user?.role === 'FACULTY') return '/faculty/analytics';
    if (user?.role === 'ADMIN') return '/admin/analytics';
    return '/analytics';
  };

  const getIntelligenceLink = () => {
    if (user?.role === 'FACULTY') return '/faculty/intelligence';
    if (user?.role === 'ADMIN') return '/admin/intelligence';
    return '/insights';
  };

  const getInterventionLink = () => {
    if (user?.role === 'FACULTY') return '/faculty/interventions';
    if (user?.role === 'ADMIN') return '/admin/interventions';
    return '/interventions';
  };

  return (
    <MainLayout>
      {/* Role Adapted Banner */}
      {renderRoleDashboardHeader()}

      {/* Role Authorization Verification Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Role Authorization Tester</h2>
            <p className="text-xs text-slate-400">
              Verify backend HTTP 403 authorization rules for your active role: <span className="text-indigo-400 font-semibold">{user?.role}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => handleTestRole('ADMIN')}
            disabled={testLoading}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Test Admin Endpoint (/api/admin/test)
          </button>
          <button
            onClick={() => handleTestRole('FACULTY')}
            disabled={testLoading}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Test Faculty Endpoint (/api/faculty/test)
          </button>
          <button
            onClick={() => handleTestRole('STUDENT')}
            disabled={testLoading}
            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            Test Student Endpoint (/api/student/test)
          </button>
        </div>

        {/* Live Test Result Box */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            } transition-all`}
          >
            <div className="flex items-center gap-2 text-sm font-bold mb-1">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Shield className="w-5 h-5 text-amber-400" />
              )}
              <span>{testResult.endpoint}</span>
              <span className="ml-auto text-xs px-2.5 py-0.5 rounded bg-slate-950 font-mono">
                {testResult.success ? 'HTTP 200 OK' : 'HTTP 403 Forbidden (Blocked as Expected)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 ml-7">
              {testResult.success
                ? `✅ Access Granted: Your role (${user?.role}) is authorized for this endpoint.`
                : `🛡️ Security Rule Enforced: HTTP 403 Forbidden. Role ${user?.role} cannot access ${testResult.targetRole} endpoint.`}
            </p>
          </div>
        )}
      </div>

      {/* Grid of All Implemented Platform Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>EduPulse Integrated Modules</span>
          </h2>
          <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
            All 8 Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Module 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Module 1
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Authentication & Users</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                JWT auth, HTTP-only session cookies, role isolation, and user profile management.
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 text-indigo-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              <span>View Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-cyan-600/20 text-cyan-400 rounded-xl">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Module 2
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Digital Learning & Courses</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Course catalog, syllabus modules, PDF/video materials, and enrollment tracking.
              </p>
            </div>
            <Link
              to={getCourseLink()}
              className="inline-flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 text-cyan-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              <span>Open Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Module 3
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Assignments & Quizzes</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Auto-graded MCQ quizzes, assignment file uploads, rubrics, and faculty feedback.
              </p>
            </div>
            <Link
              to={getCourseLink()}
              className="inline-flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 text-purple-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              <span>View Assessments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 4 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Module 4
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Attendance Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Time-expiring OTP self check-in, attendance logs, and &lt;75% threshold risk flags.
              </p>
            </div>
            <Link
              to="/attendance"
              className="inline-flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 text-emerald-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              <span>Attendance Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 5 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-sky-600/20 text-sky-400 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Module 5
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Faculty Discussion Forums</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Course Q&A threads, peer upvoting, faculty endorsement badges, and solution pinning.
              </p>
            </div>
            <Link
              to="/forum"
              className="inline-flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 text-sky-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              <span>Open Forum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 6 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-amber-600/20 text-amber-400 rounded-xl">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Module 6
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Performance Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Multi-metric student scores, course grade distributions, and topic performance accuracy.
              </p>
            </div>
            <Link
              to={getAnalyticsLink()}
              className="inline-flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              <span>Analytics Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 7 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-violet-600/20 text-violet-400 rounded-xl">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Module 7
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Academic Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Explainable risk scores (0-100), learning gap detection, and personalized study actions.
              </p>
            </div>
            <Link
              to={getIntelligenceLink()}
              className="inline-flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 text-violet-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              <span>Intelligence Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Module 8 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between group hover:border-indigo-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-rose-600/20 text-rose-400 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Module 8
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Intervention & Improvement</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Closed-loop action tracking, student reflections, faculty reviews, and score gain measurement.
              </p>
            </div>
            <Link
              to={getInterventionLink()}
              className="inline-flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 text-rose-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              <span>Intervention Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
