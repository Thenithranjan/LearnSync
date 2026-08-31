import React, { useState } from 'react';
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
  UserCheck
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
        message: data.message,
        data: data
      });
    } catch (err) {
      setTestResult({
        success: false,
        endpoint: `/api/${targetRole.toLowerCase()}/test`,
        message: err.message || 'Authorization rejected',
        data: err.data
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
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            } transition-all`}
          >
            <div className="flex items-center gap-2 text-sm font-bold mb-1">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <span>{testResult.endpoint}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-950 font-mono">
                {testResult.success ? 'HTTP 200 OK' : 'HTTP 403 Forbidden'}
              </span>
            </div>
            <p className="text-xs text-slate-300 ml-7">{testResult.message}</p>
          </div>
        )}
      </div>

      {/* Grid of Planned Platform Modules (Placeholder Grid) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>EduPulse Platform Modules</span>
          </h2>
          <span className="text-xs px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-medium">
            Module 1 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Module 1 Card */}
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Fully Implemented
              </span>
            </div>
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl w-fit mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Authentication & User Management</h3>
            <p className="text-xs text-slate-400 mb-4">
              Secure JWT authentication, HTTP-only cookie sessions, role authorization, and user profile management.
            </p>
            <div className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1">
              Active Module 1 Foundation
            </div>
          </div>

          {/* Module 2 Placeholder */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative opacity-75 hover:opacity-100 transition-opacity">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
                <Clock className="w-3 h-3" /> Module 2
              </span>
            </div>
            <div className="p-3 bg-slate-800 text-slate-400 rounded-xl w-fit mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Digital Learning</h3>
            <p className="text-xs text-slate-400 mb-4">
              Course management, interactive syllabus modules, and multimedia material delivery.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">Coming Soon</div>
          </div>

          {/* Module 3 Placeholder */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative opacity-75 hover:opacity-100 transition-opacity">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
                <Clock className="w-3 h-3" /> Module 3
              </span>
            </div>
            <div className="p-3 bg-slate-800 text-slate-400 rounded-xl w-fit mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Assignments & Quizzes</h3>
            <p className="text-xs text-slate-400 mb-4">
              Automated grading, timed quizzes, submission tracking, and evaluation rubrics.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">Coming Soon</div>
          </div>

          {/* Module 4 Placeholder */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative opacity-75 hover:opacity-100 transition-opacity">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
                <Clock className="w-3 h-3" /> Module 4
              </span>
            </div>
            <div className="p-3 bg-slate-800 text-slate-400 rounded-xl w-fit mb-3">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Performance Analytics</h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time student progress tracking, grade distribution visualizers, and learning gap detection.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">Coming Soon</div>
          </div>

          {/* Module 5 Placeholder */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative opacity-75 hover:opacity-100 transition-opacity">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
                <Clock className="w-3 h-3" /> Module 5
              </span>
            </div>
            <div className="p-3 bg-slate-800 text-slate-400 rounded-xl w-fit mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Academic Intelligence & AI</h3>
            <p className="text-xs text-slate-400 mb-4">
              Personalized recommendations and AI-powered study assistance.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">Coming Soon</div>
          </div>

          {/* Module 6 Placeholder */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg relative opacity-75 hover:opacity-100 transition-opacity">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full">
                <Clock className="w-3 h-3" /> Module 6
              </span>
            </div>
            <div className="p-3 bg-slate-800 text-slate-400 rounded-xl w-fit mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Faculty Early-Warning & Intervention</h3>
            <p className="text-xs text-slate-400 mb-4">
              Proactive student risk scores and early warning triggers for academic advisors.
            </p>
            <div className="text-[11px] text-slate-500 font-medium">Coming Soon</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
