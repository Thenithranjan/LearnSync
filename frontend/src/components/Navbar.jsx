import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  LogOut,
  Shield,
  BookOpen,
  Award,
  Layers,
  Compass,
  TrendingUp,
  BarChart3,
  Brain,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'FACULTY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen className="w-3 h-3" /> Faculty
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Award className="w-3 h-3" /> Student
          </span>
        );
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                EduPulse
              </span>
              <span className="hidden sm:block text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
                Academic Intelligence Platform
              </span>
            </div>
          </Link>

          {/* Dynamic Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* Role Specific Module 2 Links */}
            <Link
              to="/courses"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive('/courses')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Catalog</span>
            </Link>

            {user?.role === 'STUDENT' && (
              <Link
                to="/my-courses"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isActive('/my-courses')
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>My Courses</span>
              </Link>
            )}

            {user?.role === 'FACULTY' && (
              <Link
                to="/faculty/courses"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isActive('/faculty/courses')
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Course Studio</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/courses"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  isActive('/admin/courses')
                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Course Admin</span>
              </Link>
            )}

            {user?.role === 'STUDENT' && (
              <>
                <Link
                  to="/analytics"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/analytics')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
                <Link
                  to="/insights"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/insights')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Insights</span>
                </Link>
                <Link
                  to="/interventions"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/interventions')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Actions</span>
                </Link>
              </>
            )}

            {user?.role === 'FACULTY' && (
              <>
                <Link
                  to="/faculty/analytics"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/faculty/analytics')
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
                <Link
                  to="/faculty/intelligence"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/faculty/intelligence')
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>Intelligence</span>
                </Link>
                <Link
                  to="/faculty/interventions"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/faculty/interventions')
                      ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Interventions</span>
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/analytics"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/admin/analytics')
                      ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Analytics</span>
                </Link>
                <Link
                  to="/admin/intelligence"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/admin/intelligence')
                      ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Brain className="w-4 h-4 text-rose-400" />
                  <span>Intelligence</span>
                </Link>
                <Link
                  to="/admin/interventions"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive('/admin/interventions')
                      ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4 text-rose-400" />
                  <span>Action Center</span>
                </Link>
              </>
            )}

            <Link
              to="/profile"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive('/profile')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </nav>

          {/* User Section & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-semibold shadow-inner">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-200 line-clamp-1">
                  {user?.name}
                </span>
                <div className="flex items-center gap-2">
                  {getRoleBadge(user?.role)}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 transition-all duration-200 disabled:opacity-50"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
