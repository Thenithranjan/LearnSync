import React, { useState, useEffect } from 'react';
import api from './services/api';
import { loginApi, logoutApi, getMeApi } from './services/authService';
import { getCoursesApi } from './services/courseService';
import {
  LayoutDashboard, BookOpen, Users, ClipboardList, FileQuestion,
  CalendarCheck, MessageSquare, BarChart2, Lightbulb, ShieldAlert,
  Settings, Bell, Search, ChevronDown, Activity, AlertCircle,
  TrendingDown, TrendingUp, ChevronRight, PlusCircle, Menu, X,
  Target, Building2, GraduationCap, Zap, CheckCircle2, Clock,
  ArrowUpRight, ArrowDownRight, Globe, Award, Filter, Flame,
  RefreshCw, Eye, Brain, Star, Radar, Trophy, Send, Upload,
  CheckSquare, Circle, MoreHorizontal, Sliders, UserCheck,
  BookOpenCheck, Timer, Percent, Hash, Download, Edit3, Trash2,
  ChevronUp, MapPin, ToggleLeft, ToggleRight, Plus, UserX,
  MessageCircle, ThumbsUp, Paperclip, Mic, Video
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, Radar as RechartsRadar,
  LineChart,
} from 'recharts';

// ─── Page Types ───────────────────────────────────────────────────────────────

type Page =
  | 'student-dashboard' | 'student-courses' | 'student-assignments'
  | 'student-quizzes'   | 'student-attendance' | 'student-progress'
  | 'student-discussions'
  | 'faculty-dashboard' | 'faculty-intelligence' | 'faculty-students'
  | 'faculty-interventions' | 'faculty-analytics'
  | 'faculty-assignments' | 'faculty-attendance'
  | 'admin-dashboard' | 'admin-departments' | 'admin-faculty'
  | 'admin-interventions' | 'admin-analytics' | 'admin-settings';

// ─── Nav ─────────────────────────────────────────────────────────────────────

const STUDENT_NAV: { label: string; icon: React.ElementType; pageId: Page }[] = [
  { label: 'My Dashboard',  icon: LayoutDashboard, pageId: 'student-dashboard'   },
  { label: 'My Courses',    icon: BookOpen,         pageId: 'student-courses'     },
  { label: 'Assignments',   icon: ClipboardList,    pageId: 'student-assignments' },
  { label: 'Quizzes',       icon: FileQuestion,     pageId: 'student-quizzes'     },
  { label: 'Attendance',    icon: CalendarCheck,    pageId: 'student-attendance'  },
  { label: 'Discussions',   icon: MessageSquare,    pageId: 'student-discussions' },
  { label: 'My Progress',   icon: BarChart2,        pageId: 'student-progress'    },
];

const FACULTY_NAV: { label: string; icon: React.ElementType; pageId: Page }[] = [
  { label: 'Dashboard',            icon: LayoutDashboard, pageId: 'faculty-dashboard'     },
  { label: 'Students',             icon: Users,           pageId: 'faculty-students'      },
  { label: 'Assignments',          icon: ClipboardList,   pageId: 'faculty-assignments'   },
  { label: 'Attendance',           icon: CalendarCheck,   pageId: 'faculty-attendance'    },
  { label: 'Performance Analytics',icon: BarChart2,       pageId: 'faculty-analytics'     },
  { label: 'Academic Intelligence',icon: Lightbulb,       pageId: 'faculty-intelligence'  },
  { label: 'Interventions',        icon: ShieldAlert,     pageId: 'faculty-interventions' },
];

const ADMIN_NAV: { label: string; icon: React.ElementType; pageId: Page }[] = [
  { label: 'Admin Dashboard', icon: LayoutDashboard, pageId: 'admin-dashboard'    },
  { label: 'Departments',     icon: Building2,       pageId: 'admin-departments'  },
  { label: 'Faculty',         icon: GraduationCap,   pageId: 'admin-faculty'      },
  { label: 'Interventions',   icon: ShieldAlert,     pageId: 'admin-interventions'},
  { label: 'Analytics',       icon: BarChart2,       pageId: 'admin-analytics'    },
  { label: 'System Settings', icon: Settings,        pageId: 'admin-settings'     },
];

// ─── Shared Data ─────────────────────────────────────────────────────────────

const performanceTrend: any[] = [];

const subjectRadar: any[] = [];
const studentCourses: any[] = [];

const intelligenceLoop = [
  { id: 'detect',    label: 'Detect',    icon: Radar,      desc: 'Attendance drops & quiz slumps flagged in real-time' },
  { id: 'understand',label: 'Understand',icon: Brain,      desc: 'Root causes identified — topic gaps, engagement drop' },
  { id: 'recommend', label: 'Recommend', icon: Lightbulb,  desc: 'Tailored study plan and resources surfaced' },
  { id: 'intervene', label: 'Intervene', icon: Zap,        desc: 'Faculty alerted, office hours & peer tutoring scheduled' },
  { id: 'improve',   label: 'Improve',   icon: TrendingUp, desc: 'Progress tracked and loop restarts on next signal' },
];

const recentActivity: any[] = [];
const assignments: any[] = [];
const quizzes: any[] = [];
const attendanceData: any[] = [];
const attendanceByCourse: any[] = [];
const discussions: any[] = [];

// Faculty / Admin shared
const allStudents: any[] = [];
const interventionsList: any[] = [];
const courseAnalytics: any[] = [];
const attentionTopics: any[] = [];
const departmentData: any[] = [];
const enrollmentTrend: any[] = [];
const interventionOutcomes: any[] = [];
const recentAlerts: any[] = [];
const topFaculty: any[] = [];
const facultyRoster: any[] = [];
const adminInterventions: any[] = [];
const analyticsScoreDist: any[] = [];
const deptTrendData: any[] = [];

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<Page>('student-dashboard');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Interactive Toast & Modal State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' | 'danger' } | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Health check & session restore on mount
  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      try {
        const res = await api.get('/health');
        if (isMounted && res.data?.status === 'ok') {
          setApiConnected(true);
        }
      } catch (err) {
        if (isMounted) setApiConnected(false);
      }
    };

    const restoreUser = async () => {
      try {
        const me = await getMeApi();
        if (isMounted && me?.user) {
          setCurrentUser(me.user);
        }
      } catch (err) {
        // Unauthenticated or default fallback
      }
    };

    checkApi();
    restoreUser();
    const interval = setInterval(checkApi, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const role = activePage.startsWith('admin') ? 'admin'
    : activePage.startsWith('faculty') ? 'faculty' : 'student';

  const handleRoleSwitch = async (r: 'student' | 'faculty' | 'admin') => {
    const targetPage = r === 'student' ? 'student-dashboard' : r === 'faculty' ? 'faculty-dashboard' : 'admin-dashboard';
    setActivePage(targetPage);
    // Auto sync session with demo account for selected portal
    const demoEmail = r === 'admin' ? 'admin@example.com' : r === 'faculty' ? 'faculty@example.com' : 'student@example.com';
    try {
      const authRes = await loginApi(demoEmail, 'Password123!');
      if (authRes?.user) {
        setCurrentUser(authRes.user);
        showToast(`Switched to ${r.toUpperCase()} Portal (${authRes.user.name})`, 'info');
      }
    } catch (e) {
      showToast(`Switched to ${r.toUpperCase()} Portal`, 'info');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutApi();
      setCurrentUser(null);
      setProfileDropdownOpen(false);
      showToast('Signed out successfully', 'info');
    } catch (err) {
      setCurrentUser(null);
      setProfileDropdownOpen(false);
      showToast('Signed out', 'info');
    }
  };

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'faculty' ? FACULTY_NAV : STUDENT_NAV;

  const userName = currentUser?.name || (role === 'admin' ? 'System Admin' : role === 'faculty' ? 'Dr. Alan Faculty' : 'John Student');
  const userRole = role === 'admin' ? 'Administrator' : role === 'faculty' ? 'Faculty' : 'Student · CSE Yr 2';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const searchPlaceholder = role === 'admin' ? 'Search departments, faculty...' : role === 'faculty' ? 'Search students, courses...' : 'Search courses, topics...';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center px-6 border-b border-slate-100 justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">EduPulse</span>
          </div>
          <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {/* Role switcher */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex rounded-lg bg-slate-100 p-1 gap-1">
            {(['student', 'faculty', 'admin'] as const).map(r => (
              <button key={r} onClick={() => handleRoleSwitch(r)}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${role === r ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1" style={{ scrollbarWidth: 'none' }}>
          <div className="mb-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {role === 'admin' ? 'Admin Portal' : role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
          </div>
          {navItems.map(item => (
            <button key={item.label} onClick={() => { setActivePage(item.pageId); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${activePage === item.pageId ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}`}>
              <item.icon className={`w-5 h-5 transition-colors ${activePage === item.pageId ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'}`} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { setActivePage('admin-settings'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />Settings
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}><Menu className="w-6 h-6" /></button>
            <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-100/50 hover:bg-slate-100 rounded-xl border border-transparent focus-within:border-brand-300 focus-within:bg-white focus-within:shadow-sm transition-all w-80">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder={searchPlaceholder} className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder-slate-400" />
            </div>
            {/* Live API status badge */}
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${apiConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : apiConnected === false ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : apiConnected === false ? 'bg-rose-500' : 'bg-amber-500 animate-ping'}`}></span>
              {apiConnected ? 'API Connected (v1.0)' : apiConnected === false ? 'Backend Offline' : 'Connecting API...'}
            </div>
          </div>
          <div className="flex items-center gap-5 relative">
            <button onClick={() => setModalType('notifications')} className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            
            <div className="relative">
              <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} className="flex items-center gap-3 group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 leading-none group-hover:text-brand-600 transition-colors">{userName}</p>
                  <p className="text-xs text-slate-500 mt-1">{userRole}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-slate-100 group-hover:border-brand-200 transition-colors shadow-sm flex items-center justify-center text-slate-600 font-bold text-sm">{userInitials}</div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500">{currentUser?.email || 'user@edupulse.edu'}</p>
                  </div>
                  <button onClick={() => { setActivePage('admin-settings'); setProfileDropdownOpen(false); }} className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" /> Profile & Account Settings
                  </button>
                  <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 mt-1">
                    <UserX className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-20">
          {activePage === 'student-dashboard'   && <StudentDashboardPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'student-courses'     && <StudentCoursesPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} onToast={showToast} />}
          {activePage === 'student-assignments' && <StudentAssignmentsPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'student-quizzes'     && <StudentQuizzesPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'student-attendance'  && <StudentAttendancePage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'student-discussions' && <StudentDiscussionsPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'student-progress'    && <StudentProgressPage />}
          {activePage === 'faculty-dashboard'   && <FacultyDashboardPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'faculty-intelligence'&& <FacultyIntelligencePage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'faculty-students'    && <FacultyStudentsPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'faculty-assignments' && <FacultyAssignmentsPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'faculty-attendance'  && <FacultyAttendancePage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'faculty-analytics'   && <FacultyAnalyticsPage />}
          {activePage === 'faculty-interventions'&& <FacultyInterventionsPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
          {activePage === 'admin-dashboard'     && <AdminDashboardPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} onToast={showToast} />}
          {activePage === 'admin-departments'   && <AdminDepartmentsPage onToast={showToast} />}
          {activePage === 'admin-faculty'       && <AdminFacultyPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} onToast={showToast} />}
          {activePage === 'admin-interventions' && <AdminInterventionsPage onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} onToast={showToast} />}
          {activePage === 'admin-analytics'     && <AdminAnalyticsPage />}
          {activePage === 'admin-settings'      && <AdminSettingsPage onToast={showToast} />}
        </div>
      </main>

      {/* Universal Interactive Action Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 lg:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-xl font-bold text-slate-900 capitalize">
                {modalType.replace('-', ' ')}
              </h3>
              <button onClick={() => { setModalType(null); setModalData(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Forms */}
            {modalType === 'submit-assignment' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">Submitting for: <span className="text-slate-900 font-bold">{modalData?.title || 'Assignment'}</span></p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Solution Summary / Text</label>
                  <textarea rows={4} placeholder="Type your solution summary, GitHub link, or answers here..." className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-brand-500 outline-none" />
                </div>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 hover:bg-slate-100/50 cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Attach Document / Code File</p>
                  <p className="text-[10px] text-slate-400">PDF, ZIP, or DOCX up to 10MB</p>
                </div>
                <button onClick={() => { setModalType(null); showToast('Assignment Submitted Successfully!', 'success'); }} className="w-full py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">
                  Submit Work
                </button>
              </div>
            )}

            {modalType === 'take-quiz' && (
              <div className="space-y-4">
                <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 flex justify-between items-center text-xs text-brand-700 font-semibold">
                  <span>Quiz: {modalData?.title || 'Knowledge Assessment'}</span>
                  <span>Time Left: 24:12</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-900">Q1: Which algorithmic paradigm is used in Divide & Conquer?</p>
                  {['Breaking problem into independent subproblems', 'Greedy local choice', 'Brute force enumeration', 'Backtracking state tree'].map((opt, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700">
                      <input type="radio" name="q1" defaultChecked={i===0} className="text-brand-600" />
                      {opt}
                    </label>
                  ))}
                </div>
                <button onClick={() => { setModalType(null); showToast('Quiz Completed! Score: 100%', 'success'); }} className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                  Submit Quiz Answers
                </button>
              </div>
            )}

            {modalType === 'self-checkin' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Enter the 6-digit OTP code displayed on the classroom screen to record your attendance.</p>
                <input type="text" maxLength={6} defaultValue="849201" placeholder="OTP Code" className="w-full text-center tracking-widest text-2xl font-bold py-3 border border-slate-200 rounded-2xl outline-none focus:border-brand-500" />
                <button onClick={() => { setModalType(null); showToast('Attendance Recorded Successfully!', 'success'); }} className="w-full py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">
                  Verify OTP & Check-In
                </button>
              </div>
            )}

            {modalType === 'new-thread' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thread Title</label>
                  <input type="text" placeholder="e.g. Question regarding BGP Routing table updates" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Context</label>
                  <textarea rows={4} placeholder="Describe your question or discussion point in detail..." className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500" />
                </div>
                <button onClick={() => { setModalType(null); showToast('Discussion Thread Published!', 'success'); }} className="w-full py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">
                  Post Thread
                </button>
              </div>
            )}

            {modalType === 'create-course' && (
              <div className="space-y-3">
                <input type="text" placeholder="Course Title (e.g. Cloud Computing Systems)" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500" />
                <input type="text" placeholder="Course Code (e.g. CSE402)" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Credits (e.g. 4)" className="p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500" />
                  <input type="text" placeholder="Department (e.g. CSE)" className="p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500" />
                </div>
                <button onClick={() => { setModalType(null); showToast('Course Created & Published!', 'success'); }} className="w-full py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">
                  Save Course
                </button>
              </div>
            )}

            {modalType === 'record-attendance' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">Mark student roster attendance for today's session.</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {['Arun Kumar', 'Karthik S.', 'Neha R.', 'Vijay S.', 'Priya M.'].map((st, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs font-semibold">
                      <span>{st}</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked={i!==1} className="w-4 h-4 text-emerald-600 rounded" />
                        <span className="text-slate-600">Present</span>
                      </label>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setModalType(null); showToast('Attendance Roster Saved!', 'success'); }} className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                  Confirm & Save Attendance
                </button>
              </div>
            )}

            {modalType === 'create-intervention' && (
              <div className="space-y-3">
                <input type="text" placeholder="Student Name (e.g. Arun Kumar)" className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500" />
                <select className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 text-slate-700">
                  <option>Office Hours Scheduled</option>
                  <option>Peer Tutoring Assigned</option>
                  <option>Resource Recommendation</option>
                  <option>Counseling Referral</option>
                </select>
                <textarea rows={3} placeholder="Notes and intervention objective..." className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500" />
                <button onClick={() => { setModalType(null); showToast('Intervention Scheduled & Student Notified!', 'success'); }} className="w-full py-3 bg-amber-600 text-white font-bold text-sm rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20">
                  Schedule Intervention
                </button>
              </div>
            )}

            {modalType === 'notifications' && (
              <div className="space-y-3">
                {recentAlerts.map((alt) => (
                  <div key={alt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3 text-xs">
                    <AlertDot type={alt.type} />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{alt.message}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{alt.dept} · {alt.time}</p>
                    </div>
                  </div>
                ))}
                <button onClick={() => { setModalType(null); showToast('All notifications marked as read', 'info'); }} className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200">
                  Mark All as Read
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STUDENT PAGES
// ════════════════════════════════════════════════════════════════════════════

function StudentDashboardPage() {
  const [activeLoop, setActiveLoop] = useState(0);
  const overallScore = 0;
  const gradients = ['from-brand-500 to-brand-600','from-violet-500 to-violet-600','from-amber-500 to-amber-600','from-rose-500 to-rose-600','from-emerald-500 to-emerald-600'];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-8 lg:p-12 shadow-2xl shadow-brand-500/30">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-4 -top-4 w-52 h-52 rounded-full border border-white/10 pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-white opacity-60"></span><span className="relative h-2 w-2 rounded-full bg-white"></span></span>
              Live Academic Pulse
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2">Welcome to EduPulse</h1>
            <p className="text-white/70 text-base max-w-md leading-relaxed">Your academic dashboard will populate once courses and data are available from the system.</p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <PulseStat label="Overall Score" value="—" /><div className="w-px h-8 bg-white/20"></div>
              <PulseStat label="Attendance" value="—" /><div className="w-px h-8 bg-white/20"></div>
              <PulseStat label="Streak" value="—" icon={Flame} />
            </div>
          </div>
          <div className="w-36 h-36 lg:w-44 lg:h-44 relative flex-none">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50 * overallScore / 100} ${2 * Math.PI * 50}`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-white">{overallScore}%</p>
              <p className="text-xs text-white/60 font-medium mt-0.5">Overall</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trend + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-lg font-semibold text-slate-900">Performance Trend</h2><p className="text-sm text-slate-400 mt-0.5">Your quiz scores vs. class average</p></div>
            {performanceTrend.length > 0 && <span className="text-xs font-semibold text-success-600 bg-success-50 px-2.5 py-1 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +17pts</span>}
          </div>
          <div className="h-52">
            {performanceTrend.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
                No performance data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceTrend} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.12)', fontSize: '13px' }} />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#scoreGrad)" name="Your Score" dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="avg" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" name="Class Avg" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <StudentStatCard label="Assignments Completed" value="— / —" sub="No data yet" accent="warning" icon={ClipboardList} />
          <StudentStatCard label="Quiz Average" value="—" sub="No data yet" accent="success" icon={Star} />
          <StudentStatCard label="Topics Needing Work" value="—" sub="No data yet" accent="danger" icon={AlertCircle} />
        </div>
      </div>

      {/* Courses */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">My Courses</h2>
        {studentCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-400 text-sm">
            No courses enrolled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {studentCourses.map(course => {
              const sm = { good: { bar:'bg-success-500', badge:'bg-success-50 text-success-700', text:'On Track' }, warning: { bar:'bg-warning-500', badge:'bg-warning-50 text-warning-700', text:'Needs Attention' }, danger: { bar:'bg-danger-500', badge:'bg-danger-50 text-danger-700', text:'At Risk' } };
              const s = sm[course.status as keyof typeof sm];
              return (
                <div key={course.code} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 lg:p-6 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div><p className="text-xs font-semibold text-slate-400 mb-1">{course.code}</p><h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{course.name}</h3></div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>{s.text}</span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5"><span>Attendance</span><span className="font-semibold text-slate-600">{course.attendance}%</span></div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.bar}`} style={{ width: `${course.attendance}%` }}></div></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">{course.score}%</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Intelligence Loop */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-10">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-brand-500" />How EduPulse Supports You</h2>
          <p className="text-sm text-slate-400 mt-1">Closed-loop academic intelligence — continuously working in the background.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {intelligenceLoop.map((item, i) => {
            const Icon = item.icon; const isActive = activeLoop === i;
            return (
              <button key={item.id} onClick={() => setActiveLoop(i)}
                className={`relative text-left p-5 rounded-2xl border transition-all duration-200 ${isActive ? 'border-brand-200 bg-brand-50 shadow-md shadow-brand-500/10 scale-[1.02]' : 'border-slate-200 bg-slate-50/50 hover:border-brand-200 hover:bg-brand-50/40'}`}>
                {i < intelligenceLoop.length - 1 && <div className="hidden sm:block absolute top-1/2 -right-4 w-4 h-px bg-slate-200 z-10"></div>}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[i]} flex items-center justify-center mb-3 shadow-md`}><Icon className="w-5 h-5 text-white" /></div>
                <p className="text-sm font-bold text-slate-900 mb-1">{item.label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                {isActive && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-brand-500"><span className="absolute inset-0 rounded-full bg-brand-400 animate-ping"></span></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((item, i) => {
            const Icon = item.icon;
            const t: Record<string, string> = { success: 'bg-success-50 text-success-600', warning: 'bg-warning-50 text-warning-600', info: 'bg-brand-50 text-brand-600' };
            return (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${t[item.type]}`}><Icon className="w-4 h-4" /></div>
                <p className="flex-1 text-sm text-slate-700">{item.text}</p>
                <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentCoursesPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const sm: Record<string, { bar: string; badge: string; text: string; border: string }> = {
    good:    { bar: 'bg-success-500', badge: 'bg-success-50 text-success-700', text: 'On Track',        border: 'border-success-200' },
    warning: { bar: 'bg-warning-500', badge: 'bg-warning-50 text-warning-700', text: 'Needs Attention', border: 'border-warning-200' },
    danger:  { bar: 'bg-danger-500',  badge: 'bg-danger-50 text-danger-700',   text: 'At Risk',         border: 'border-danger-200'  },
  };

  if (studentCourses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader icon={BookOpen} title="My Courses" subtitle="Track your enrolled courses, progress, and upcoming deliverables." />
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-brand-400" /></div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Courses Enrolled</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">You haven't enrolled in any courses yet. Once you're enrolled, your courses and progress will appear here.</p>
        </div>
      </div>
    );
  }

  const selCourse = studentCourses.find(c => c.code === selected) ?? studentCourses[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={BookOpen} title="My Courses" subtitle="Track your enrolled courses, progress, and upcoming deliverables." />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Course list */}
        <div className="lg:col-span-2 space-y-3">
          {studentCourses.map(course => {
            const s = sm[course.status];
            const active = (selected ?? studentCourses[0]?.code) === course.code;
            return (
              <button key={course.code} onClick={() => setSelected(course.code)}
                className={`w-full text-left bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md ${active ? `${s.border} ring-1 ring-inset ${s.border}` : 'border-slate-200 hover:border-brand-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div><p className="text-xs font-semibold text-slate-400">{course.code} · {course.credits} cr</p><h3 className="font-bold text-slate-900 mt-0.5">{course.name}</h3><p className="text-xs text-slate-400 mt-1">{course.instructor}</p></div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.badge}`}>{s.text}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress</span><span className="font-semibold">{course.done}/{course.modules} modules</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${Math.round(course.done / course.modules * 100)}%` }}></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Course detail */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-1">{selCourse.code}</p>
                <h2 className="text-xl font-bold text-slate-900">{selCourse.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{selCourse.instructor} · {selCourse.credits} Credits</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${sm[selCourse.status].badge}`}>{sm[selCourse.status].text}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <MiniStat label="Score" value={`${selCourse.score}%`} />
              <MiniStat label="Attendance" value={`${selCourse.attendance}%`} />
              <MiniStat label="Modules" value={`${selCourse.done}/${selCourse.modules}`} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Upcoming Deadlines</h3>
            {assignments.filter(a => a.course === selCourse.code).length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">No upcoming deadlines for this course.</p>
            )}
            {assignments.filter(a => a.course === selCourse.code).map(a => (
              <div key={a.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div><p className="text-sm font-medium text-slate-800">{a.title}</p><p className="text-xs text-slate-400 mt-0.5">Due {a.due} · {a.weight}</p></div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentAssignmentsPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const [tab, setTab] = useState<'all'|'pending'|'submitted'|'graded'>('all');
  const filtered = tab === 'all' ? assignments : assignments.filter(a => a.status === tab);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={ClipboardList} title="Assignments" subtitle="Track, submit, and review all your assignment work." />

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Pending" value={assignments.filter(a=>a.status==='pending').length} color="warning" icon={Clock} />
        <SummaryCard label="Submitted" value={assignments.filter(a=>a.status==='submitted').length} color="brand" icon={Upload} />
        <SummaryCard label="Graded" value={assignments.filter(a=>a.status==='graded').length} color="success" icon={CheckSquare} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1.5 bg-slate-100 rounded-lg p-1">
            {(['all','pending','submitted','graded'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${tab===t ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"><Filter className="w-3.5 h-3.5" />Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50/60 text-left">
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignment</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Course</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Due</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Weight</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-900">{a.title}</p></td>
                  <td className="px-4 py-4"><span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded-md">{a.course}</span></td>
                  <td className="px-4 py-4 text-sm text-slate-600">{a.due}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{a.weight}</td>
                  <td className="px-4 py-4"><span className={`text-sm font-bold ${a.score ? (a.score >= 70 ? 'text-success-600' : 'text-warning-600') : 'text-slate-400'}`}>{a.score ? `${a.score}%` : '—'}</span></td>
                  <td className="px-4 py-4"><StatusBadge status={a.status} /></td>
                  <td className="px-6 py-4">
                    {a.status === 'pending' && <button onClick={() => onOpenModal?.('submit-assignment', a)} className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-1 shadow-sm"><Upload className="w-3 h-3" />Submit</button>}
                    {a.status === 'graded'  && <button onClick={() => onOpenModal?.('submit-assignment', a)} className="text-xs text-brand-600 font-semibold hover:underline">View</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentQuizzesPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={FileQuestion} title="Quizzes" subtitle="Your quiz history, upcoming tests, and performance breakdown." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Upcoming" value={quizzes.filter(q=>q.status==='upcoming').length} color="brand" icon={Timer} />
        <SummaryCard label="Completed" value={quizzes.filter(q=>q.status==='graded').length} color="success" icon={CheckCircle2} />
        <SummaryCard label="Avg Score" value="71%" color="warning" icon={Percent} />
        <SummaryCard label="Best Score" value="82%" color="success" icon={Trophy} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Timer className="w-4 h-4 text-brand-500" />Upcoming</h2>
          </div>
          {quizzes.filter(q => q.status === 'upcoming').map(q => (
            <div key={q.id} className="p-5 border-b border-slate-100 last:border-0">
              <p className="text-xs font-semibold text-brand-600 mb-1">{q.course}</p>
              <p className="font-semibold text-slate-900 text-sm mb-2">{q.title}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><CalendarCheck className="w-3 h-3" />{q.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.duration}</span>
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{q.questions} Qs</span>
              </div>
              <button onClick={() => onOpenModal?.('take-quiz', q)} className="w-full py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm">Start Quiz</button>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Quiz History</h2>
            <button onClick={() => onOpenModal?.('take-quiz')} className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1"><Download className="w-3 h-3" />Export</button>
          </div>
          <div className="divide-y divide-slate-100">
            {quizzes.filter(q => q.status === 'graded').map(q => (
              <div key={q.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${q.score! >= 70 ? 'bg-success-50 text-success-700' : q.score! >= 55 ? 'bg-warning-50 text-warning-700' : 'bg-danger-50 text-danger-700'}`}>{q.score}%</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{q.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{q.course} · {q.date} · {q.questions} questions</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${q.score! >= 70 ? 'bg-success-500' : q.score! >= 55 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${q.score}%` }}></div>
                  </div>
                  <button onClick={() => onOpenModal?.('take-quiz', q)} className="text-xs text-brand-600 font-medium hover:underline ml-2">Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentAttendancePage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const days = ['Mon','Tue','Wed','Thu','Fri'];
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={CalendarCheck} title="Attendance" subtitle="Your attendance record across all enrolled courses.">
        <button onClick={() => onOpenModal?.('self-checkin')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20">
          <Zap className="w-4 h-4" />Self Check-in (OTP)
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {attendanceByCourse.map(c => (
          <div key={c.course} className={`bg-white rounded-2xl border shadow-sm p-5 ${c.pct < 75 ? 'border-danger-200' : 'border-slate-200'}`}>
            <p className="text-xs font-semibold text-slate-400 mb-1 truncate">{c.course}</p>
            <p className={`text-3xl font-bold mb-1 ${c.pct < 75 ? 'text-danger-600' : c.pct < 85 ? 'text-warning-600' : 'text-success-600'}`}>{c.pct}%</p>
            <p className="text-xs text-slate-500">{c.present} present · {c.absent} absent</p>
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${c.pct < 75 ? 'bg-danger-500' : c.pct < 85 ? 'bg-warning-500' : 'bg-success-500'}`} style={{ width: `${c.pct}%` }}></div>
            </div>
            {c.pct < 75 && <p className="text-xs text-danger-600 font-semibold mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Below minimum</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <h2 className="font-semibold text-slate-900 mb-6">August–September Calendar</h2>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div>Week</div>
            {days.map(d => <div key={d} className="text-center">{d}</div>)}
          </div>
          {attendanceData.map((week, wi) => (
            <div key={wi} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-xs text-slate-400 font-medium">{week.month} W{week.week}</div>
              {week.days.map((d, di) => (
                <div key={di} className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold ${d==='P' ? 'bg-success-50 text-success-700' : d==='A' ? 'bg-danger-50 text-danger-700' : 'bg-slate-50 text-slate-300'}`}>
                  {d==='P' ? 'P' : d==='A' ? 'A' : '–'}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 mt-6 pt-5 border-t border-slate-100">
          <span className="flex items-center gap-2 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm bg-success-500"></span>Present</span>
          <span className="flex items-center gap-2 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm bg-danger-500"></span>Absent</span>
          <span className="flex items-center gap-2 text-xs text-slate-500"><span className="w-3 h-3 rounded-sm bg-slate-200"></span>Holiday / No class</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentDiscussionsPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={MessageSquare} title="Discussions" subtitle="Ask questions, share insights, and collaborate with peers and faculty.">
        <button onClick={() => onOpenModal?.('new-thread')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20">
          <PlusCircle className="w-4 h-4" />New Post
        </button>
      </PageHeader>

      {compose && (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-md p-6">
          <h3 className="font-semibold text-slate-900 mb-4">New Discussion Post</h3>
          <select className="w-full mb-3 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-brand-400 bg-white">
            {studentCourses.map(c => <option key={c.code}>{c.code} — {c.name}</option>)}
          </select>
          <input placeholder="Title your question…" className="w-full mb-3 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400" />
          <textarea rows={3} placeholder="Describe your doubt or topic…" className="w-full mb-4 px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-400 resize-none"></textarea>
          <div className="flex justify-end gap-3">
            <button onClick={() => setCompose(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 flex items-center gap-2"><Send className="w-4 h-4" />Post</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {discussions.map(d => (
          <div key={d.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {d.author.split(' ').map(w => w[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{d.title}</p>
                  {d.solved && <span className="shrink-0 text-xs bg-success-50 text-success-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Solved</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-medium text-brand-600">{d.course}</span>
                  <span>by {d.you ? 'You' : d.author}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{d.replies} replies</span>
                  <span>{d.time}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 shrink-0 mt-0.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentProgressPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={BarChart2} title="My Progress" subtitle="Deep-dive into your academic performance across subjects." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">Subject Skill Map</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={subjectRadar}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <RechartsRadar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score trend */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">8-Week Score Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[50,100]} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:'10px', border:'none', boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)', fontSize:'13px' }} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#pg)" name="Score" />
                <Line type="monotone" dataKey="avg" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" name="Class Avg" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Subject Breakdown</h2></div>
        <div className="divide-y divide-slate-100">
          {subjectRadar.map(s => (
            <div key={s.subject} className="px-6 py-4 flex items-center gap-4">
              <p className="w-32 text-sm font-medium text-slate-800 shrink-0">{s.subject}</p>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.score >= 70 ? 'bg-success-500' : s.score >= 55 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${s.score}%` }}></div>
              </div>
              <span className={`text-sm font-bold w-12 text-right ${s.score >= 70 ? 'text-success-600' : s.score >= 55 ? 'text-warning-600' : 'text-danger-600'}`}>{s.score}%</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.score >= 70 ? 'bg-success-50 text-success-700' : s.score >= 55 ? 'bg-warning-50 text-warning-700' : 'bg-danger-50 text-danger-700'}`}>
                {s.score >= 70 ? 'Strong' : s.score >= 55 ? 'Average' : 'Weak'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// FACULTY PAGES
// ════════════════════════════════════════════════════════════════════════════

function FacultyDashboardPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <PageHeader icon={LayoutDashboard} title="Faculty Dashboard" subtitle="Your daily overview — classes, students, and pending actions." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard label="My Students"       value="—"  delta="No data loaded"     deltaDir="up"  icon={Users}      accent="brand"   />
        <KpiCard label="At-Risk Students"  value="—"  delta="No data loaded"      deltaDir="up"   icon={ShieldAlert} accent="danger"  />
        <KpiCard label="Avg. Class Score"  value="—"  delta="No data loaded"      deltaDir="up"  icon={BarChart2}  accent="success" />
        <KpiCard label="Pending Reviews"   value="—"  delta="No data loaded"      deltaDir="up"  icon={ClipboardList} accent="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class performance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">Class Score Distribution</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsScoreDist} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:'10px', border:'none', boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)', fontSize:'13px' }} />
                <Bar dataKey="count" radius={[4,4,0,0]} barSize={32}>
                  {analyticsScoreDist.map((_, i) => <Cell key={i} fill={i < 2 ? '#10b981' : i < 4 ? '#f59e0b' : '#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 text-sm">Today's Tasks</h3>
            <p className="text-sm text-slate-400 py-4 text-center">No tasks scheduled for today.</p>
          </div>

          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white shadow-lg shadow-brand-500/20">
            <p className="font-semibold mb-1">Class Schedule</p>
            <p className="text-xs text-white/60 mb-4">No schedule data loaded</p>
            <p className="text-sm text-white/50 py-2 text-center">Schedule will appear once courses are assigned.</p>
          </div>
        </div>
      </div>

      {/* At-risk students */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-danger-500" />Students Requiring Immediate Attention</h2>
          <span className="text-xs bg-danger-100 text-danger-700 font-bold px-2.5 py-1 rounded-full">{allStudents.filter(s => s.risk === 'high').length} students</span>
        </div>
        <div className="divide-y divide-slate-100">
          {allStudents.filter(s => s.risk === 'high').map(s => (
            <div key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                {s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-400">{s.roll} · {s.course}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-danger-600">{s.score}%</p>
                <p className="text-xs text-slate-400">Attendance: {s.attendance}%</p>
              </div>
              <button onClick={() => onOpenModal?.('create-intervention', s)} className="px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors ml-4 shadow-sm">Intervene</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyIntelligencePage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <PageHeader icon={Lightbulb} title="Academic Intelligence" subtitle="Identify areas requiring attention and coordinate student support.">
        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none shadow-sm">
          <option>All Courses</option><option>Data Structures (CSE201)</option><option>Database Systems (CSE202)</option>
        </select>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-slate-400" />Students Requiring Attention</h2>
          {allStudents.length > 0 ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <RiskMetric label="High Risk" value={allStudents.filter(s => s.risk === 'high').length} color="danger" /><div className="w-px h-12 bg-slate-100"></div>
                <RiskMetric label="Moderate" value={allStudents.filter(s => s.risk === 'medium').length} color="warning" /><div className="w-px h-12 bg-slate-100"></div>
                <RiskMetric label="Low Risk" value={allStudents.filter(s => s.risk === 'low').length} color="success" />
              </div>
              <div className="mt-8">
                <p className="text-sm font-medium text-slate-500 mb-2">Class Distribution</p>
                <div className="flex h-3 w-full rounded-full overflow-hidden gap-1">
                  <div className="bg-danger-500" style={{ width: `${(allStudents.filter(s=>s.risk==='high').length / Math.max(allStudents.length,1))*100}%` }}></div>
                  <div className="bg-warning-500" style={{ width: `${(allStudents.filter(s=>s.risk==='medium').length / Math.max(allStudents.length,1))*100}%` }}></div>
                  <div className="bg-success-500" style={{ width: `${(allStudents.filter(s=>s.risk==='low').length / Math.max(allStudents.length,1))*100}%` }}></div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 py-6 text-center">No student data available yet.</p>
          )}
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-slate-400" />Class Attention Areas</h2>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attentionTopics} layout="vertical" margin={{ top:0, right:30, left:0, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide domain={[0,100]} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill:'#475569', fontSize:13, fontWeight:500 }} width={110} />
                <Tooltip cursor={{fill:'#f8fafc'}} contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 6px -1px rgb(0 0 0/0.1)'}} />
                <Bar dataKey="score" radius={[0,4,4,0]} barSize={24}>
                  {attentionTopics.map((e,i) => <Cell key={i} fill={e.score < 50 ? '#f59e0b' : '#10b981'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">Action Required <span className="bg-danger-100 text-danger-700 text-xs font-bold px-2 py-0.5 rounded-full">{allStudents.filter(s => s.risk === 'high').length} Students</span></h2>
        {allStudents.filter(s => s.risk === 'high').length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-success-50 flex items-center justify-center mx-auto mb-3"><CheckCircle2 className="w-7 h-7 text-success-400" /></div>
            <h3 className="font-bold text-slate-900 mb-1">No High-Risk Students</h3>
            <p className="text-sm text-slate-400">All students are performing within acceptable thresholds.</p>
          </div>
        ) : (
          allStudents.filter(s=>s.risk==='high').map(s => (
            <div key={s.id} onClick={() => onOpenModal?.('create-intervention', s)} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between hover:border-brand-300 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">{s.name.split(' ').map((w: string)=>w[0]).join('').slice(0,2)}</div>
                <div><h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{s.name}</h3><p className="text-xs text-slate-500">{s.course} · Score: {s.score}%</p></div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-danger-600 text-sm font-bold bg-danger-50 px-2.5 py-1 rounded-md">HIGH</span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-colors" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyStudentsPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const [riskFilter, setRiskFilter] = useState<'all'|'high'|'medium'|'low'>('all');
  const [search, setSearch] = useState('');
  const filtered = allStudents.filter(s =>
    (riskFilter === 'all' || s.risk === riskFilter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={Users} title="My Students" subtitle="Monitor performance, attendance, and risk status for all enrolled students." />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 focus-within:border-brand-300 focus-within:shadow-sm transition-all">
          <Search className="w-4 h-4 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll number…" className="bg-transparent outline-none text-sm w-full text-slate-900 placeholder-slate-400" />
        </div>
        <div className="flex gap-1.5 bg-slate-100 rounded-lg p-1">
          {(['all','high','medium','low'] as const).map(r => (
            <button key={r} onClick={() => setRiskFilter(r)} className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${riskFilter===r ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50/60 text-left">
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Roll No.</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Course</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trend</th>
              <th className="px-6 py-3.5"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                      <span className="text-sm font-semibold text-slate-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{s.roll}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{s.course}</td>
                  <td className="px-4 py-4"><span className={`text-sm font-bold ${s.score >= 70 ? 'text-success-600' : s.score >= 55 ? 'text-warning-600' : 'text-danger-600'}`}>{s.score}%</span></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.attendance >= 75 ? 'bg-success-500' : 'bg-danger-500'}`} style={{width:`${s.attendance}%`}}></div></div>
                      <span className="text-sm text-slate-600">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.risk==='high' ? 'bg-danger-50 text-danger-700' : s.risk==='medium' ? 'bg-warning-50 text-warning-700' : 'bg-success-50 text-success-700'}`}>
                      {s.risk.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {s.trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-success-500" /> : s.trend === 'down' ? <ArrowDownRight className="w-4 h-4 text-danger-500" /> : <span className="w-4 h-0.5 bg-slate-400 inline-block"></span>}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onOpenModal?.('create-intervention', s)} className="text-xs text-brand-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:underline">Intervene <ChevronRight className="w-3 h-3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyAssignmentsPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const facultyAssignments: any[] = [];
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={ClipboardList} title="Assignments" subtitle="Manage, review, and grade assignments across your courses.">
        <button onClick={() => onOpenModal?.('create-course')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"><PlusCircle className="w-4 h-4" />New Assignment</button>
      </PageHeader>

      {facultyAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3"><ClipboardList className="w-7 h-7 text-brand-400" /></div>
          <h3 className="font-bold text-slate-900 mb-1">No Assignments Yet</h3>
          <p className="text-sm text-slate-400">Create your first assignment using the button above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {facultyAssignments.map(a => {
            const submittedPct = Math.round(a.submitted / a.total * 100);
            const gradedPct = Math.round(a.graded / a.total * 100);
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">{a.course}</span>
                    <h3 className="font-bold text-slate-900 mt-2">{a.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><CalendarCheck className="w-3 h-3" />Due {a.due}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onOpenModal?.('submit-assignment', a)} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    {a.graded < a.total && <button onClick={() => onOpenModal?.('submit-assignment', a)} className="px-3 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors">Grade ({a.submitted - a.graded} left)</button>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5"><span>Submitted</span><span className="font-semibold text-slate-700">{a.submitted}/{a.total}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{width:`${submittedPct}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5"><span>Graded</span><span className="font-semibold text-slate-700">{a.graded}/{a.total}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-success-500 rounded-full" style={{width:`${gradedPct}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5"><span>Not submitted</span><span className="font-semibold text-slate-700">{a.total-a.submitted}</span></div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-danger-400 rounded-full" style={{width:`${100-submittedPct}%`}}></div></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyAttendancePage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const sessions: any[] = [];
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={CalendarCheck} title="Attendance" subtitle="Track and manage student attendance across all sessions.">
        <button onClick={() => onOpenModal?.('record-attendance')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"><PlusCircle className="w-4 h-4" />Mark Today</button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Sessions" value={sessions.length} color="brand" icon={CalendarCheck} />
        <SummaryCard label="Avg Attendance" value="—" color="success" icon={Users} />
        <SummaryCard label="Below 75%" value="—" color="danger" icon={AlertCircle} />
        <SummaryCard label="Perfect Attendance" value="—" color="success" icon={Award} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Session Log — Data Structures (CSE201)</h2>
          <button onClick={() => onOpenModal?.('record-attendance')} className="flex items-center gap-2 text-xs text-brand-600 font-medium hover:underline"><Download className="w-3 h-3" />Export</button>
        </div>
        <div className="divide-y divide-slate-100">
          {sessions.map((s,i) => {
            const pct = Math.round(s.present / (s.present+s.absent) * 100);
            return (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="text-center w-14 shrink-0">
                  <p className="text-xs font-bold text-slate-400">{s.day}</p>
                  <p className="text-sm font-bold text-slate-900">{s.date}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{s.topic}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.present} present · {s.absent} absent</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct>=80 ? 'bg-success-500' : 'bg-warning-500'}`} style={{width:`${pct}%`}}></div></div>
                  <span className={`text-sm font-bold w-10 text-right ${pct>=80 ? 'text-success-600':'text-warning-600'}`}>{pct}%</span>
                </div>
                <button onClick={() => onOpenModal?.('record-attendance', s)} className="text-xs text-brand-600 font-medium hover:underline ml-2">Edit</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <PageHeader icon={BarChart2} title="Performance Analytics" subtitle="Deep analysis of class performance across topics and time." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">Topic-wise Average Score</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseAnalytics} layout="vertical" margin={{top:0,right:30,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0,100]} tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <YAxis dataKey="topic" type="category" width={120} tick={{fill:'#475569',fontSize:12,fontWeight:500}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:'10px',border:'none',boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)',fontSize:'13px'}} />
                <Bar dataKey="avgScore" radius={[0,4,4,0]} barSize={20}>
                  {courseAnalytics.map((e,i) => <Cell key={i} fill={e.avgScore>=70?'#10b981':e.avgScore>=55?'#f59e0b':'#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">Score Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsScoreDist} margin={{top:0,right:0,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:'10px',border:'none',boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)',fontSize:'13px'}} />
                <Bar dataKey="count" radius={[4,4,0,0]} barSize={28}>
                  {analyticsScoreDist.map((_,i) => <Cell key={i} fill={i<2?'#10b981':i<4?'#f59e0b':'#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Topic-wise Breakdown</h2></div>
        <div className="divide-y divide-slate-100">
          {courseAnalytics.map(t => (
            <div key={t.topic} className="px-6 py-4 grid grid-cols-4 gap-4 items-center hover:bg-slate-50 transition-colors">
              <p className="text-sm font-semibold text-slate-900">{t.topic}</p>
              <div>
                <p className={`text-lg font-bold ${t.avgScore>=70?'text-success-600':t.avgScore>=55?'text-warning-600':'text-danger-600'}`}>{t.avgScore}%</p>
                <p className="text-xs text-slate-400">Avg score</p>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Completion</span><span>{t.completion}%</span></div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{width:`${t.completion}%`}}></div></div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.avgScore>=70?'bg-success-50 text-success-700':t.avgScore>=55?'bg-warning-50 text-warning-700':'bg-danger-50 text-danger-700'}`}>
                  {t.avgScore>=70?'On Track':t.avgScore>=55?'Attention':'Critical'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyInterventionsPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const statusColors: Record<string, string> = {
    active:   'bg-brand-50 text-brand-700',
    pending:  'bg-warning-50 text-warning-700',
    resolved: 'bg-success-50 text-success-700',
  };
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={ShieldAlert} title="Interventions" subtitle="Track all student interventions — active, pending, and resolved.">
        <button onClick={() => onOpenModal?.('create-intervention')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"><PlusCircle className="w-4 h-4" />New Intervention</button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Active" value={interventionsList.filter(i=>i.status==='active').length} color="brand" icon={Activity} />
        <SummaryCard label="Pending" value={interventionsList.filter(i=>i.status==='pending').length} color="warning" icon={Clock} />
        <SummaryCard label="Resolved" value={interventionsList.filter(i=>i.status==='resolved').length} color="success" icon={CheckCircle2} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50/60 text-left">
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Course</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Outcome</th>
              <th className="px-6 py-3.5"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {interventionsList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{item.student.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                      <span className="text-sm font-semibold text-slate-900">{item.student}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.course}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.type}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="px-4 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[item.status]}`}>{item.status}</span></td>
                  <td className="px-4 py-4">
                    {item.outcome ? <span className="text-xs text-success-600 font-semibold capitalize">{item.outcome}</span> : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => onOpenModal?.('create-intervention', item)} className="text-xs text-brand-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADMIN PAGES
// ════════════════════════════════════════════════════════════════════════════

function AdminDashboardPage({ onOpenModal, onToast }: { onOpenModal?: (type: string, data?: any) => void; onToast?: (msg: string, type?: 'success'|'warning'|'info') => void }) {
  const [alertFilter, setAlertFilter] = useState<'all'|'critical'|'warning'>('all');
  const filteredAlerts = alertFilter === 'all' ? recentAlerts : recentAlerts.filter(a => a.type === alertFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/20"><Globe className="w-4 h-4 text-white" /></div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Institution Overview</h1>
          </div>
          <p className="text-slate-500">Real-time academic intelligence across all departments and cohorts.</p>
        </div>
        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none shadow-sm">
          <option>Semester 2</option><option>Semester 1</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <KpiCard label="Total Students"    value="—" delta="No data loaded"          deltaDir="up"  icon={Users}      accent="brand"   />
        <KpiCard label="At-Risk Students"  value="—" delta="No data loaded"          deltaDir="up"  icon={ShieldAlert} accent="danger"  />
        <KpiCard label="Avg. Performance"  value="—" delta="No data loaded"          deltaDir="up"  icon={BarChart2}  accent="success" />
        <KpiCard label="Intervention Rate" value="—" delta="No data loaded"          deltaDir="up"  icon={Zap}        accent="brand"   />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-1">Enrollment & Risk Trend</h2>
          <p className="text-sm text-slate-400 mb-6">Active students vs. flagged at-risk (monthly)</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrend} margin={{top:0,right:0,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                  <linearGradient id="rG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:'10px',border:'none',boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)',fontSize:'13px'}} />
                <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2} fill="url(#aG)" name="Active" dot={false} />
                <Area type="monotone" dataKey="atRisk" stroke="#ef4444" strokeWidth={2} fill="url(#rG)" name="At-Risk" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col">
          <h2 className="font-semibold text-slate-900 mb-1">Intervention Outcomes</h2>
          <p className="text-sm text-slate-400 mb-6">Resolved vs. pending cases</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interventionOutcomes} margin={{top:0,right:0,left:-20,bottom:0}} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:'10px',border:'none',boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)',fontSize:'13px'}} />
                <Bar dataKey="success" fill="#10b981" radius={[4,4,0,0]} barSize={14} name="Resolved" />
                <Bar dataKey="pending" fill="#f59e0b" radius={[4,4,0,0]} barSize={14} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-auto pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div><p className="text-2xl font-bold text-slate-900">—</p><p className="text-xs text-slate-400 mt-0.5">Total resolved</p></div>
            <div><p className="text-2xl font-bold text-warning-600">—</p><p className="text-xs text-slate-400 mt-0.5">Currently open</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div><h2 className="font-semibold text-slate-900 flex items-center gap-2"><Bell className="w-5 h-5 text-slate-400" />System Alerts</h2><p className="text-sm text-slate-400 mt-0.5">Recent flags requiring admin attention</p></div>
            <div className="flex gap-1.5">
              {(['all','critical','warning'] as const).map(f => (
                <button key={f} onClick={() => setAlertFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${alertFilter===f ? f==='critical'?'bg-danger-100 text-danger-700':f==='warning'?'bg-warning-100 text-warning-700':'bg-brand-100 text-brand-700' : 'text-slate-500 hover:bg-slate-100'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 divide-y divide-slate-100">
            {filteredAlerts.map(a => (
              <div key={a.id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                <AlertDot type={a.type} />
                <div className="flex-1 min-w-0"><p className="text-sm text-slate-800">{a.message}</p><p className="text-xs text-slate-400 mt-1">{a.dept} · {a.time}</p></div>
                <button onClick={() => onOpenModal?.('notifications', a)} className="text-xs text-brand-600 font-medium hover:underline mt-0.5">Review</button>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1">
            <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2"><Award className="w-5 h-5 text-slate-400" />Top Interveners</h2>
            <div className="space-y-4">
              {topFaculty.map((f,i) => (
                <div key={f.name} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i===0?'bg-yellow-100 text-yellow-700':i===1?'bg-slate-100 text-slate-600':'bg-orange-100 text-orange-700'}`}>{i+1}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p><p className="text-xs text-slate-400">{f.dept}</p></div>
                  <div className="text-right shrink-0"><p className="text-sm font-bold text-success-600">{f.successRate}%</p><p className="text-xs text-slate-400">{f.interventions} cases</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 shadow-lg shadow-brand-500/20 text-white">
            <h3 className="font-semibold text-white/90 mb-1">Pending Actions</h3>
            <p className="text-xs text-white/60 mb-5">Requires your sign-off today</p>
            <div className="space-y-3">
              <QuickAction icon={Clock} label="Approve 12 escalations" onClick={() => onToast?.("12 Escalations approved", "success")} />
              <QuickAction icon={Users} label="Review 3 faculty reports" onClick={() => onToast?.("Faculty reports opened for review", "info")} />
              <QuickAction icon={CheckCircle2} label="Close semester audits" onClick={() => onToast?.("Semester audit log finalized", "success")} />
            </div>
            <button onClick={() => onToast?.("Audit tasks logged", "info")} className="mt-6 w-full bg-white/15 hover:bg-white/25 transition-colors text-white text-sm font-semibold py-2.5 rounded-xl border border-white/20">View All Tasks</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AdminDepartmentsPage({ onToast }: { onToast?: (msg: string, type?: 'success'|'warning'|'info') => void }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={Building2} title="Departments" subtitle="Institution-wide department performance and health metrics." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {departmentData.map(d => {
          const atRiskPct = Math.round(d.atRisk / d.students * 100);
          const positive = d.trend >= 0;
          return (
            <div key={d.dept} onClick={() => onToast?.(`Viewing ${d.dept} Department Details`, 'info')} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-brand-500" /></div>
                  <div><h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{d.dept}</h3><p className="text-xs text-slate-400">{d.faculty} faculty · {d.courses} courses</p></div>
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-bold ${positive?'text-success-600':'text-danger-600'}`}>
                  {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {positive?'+':''}{d.trend}%
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center"><p className="text-xl font-bold text-slate-900">{d.students}</p><p className="text-xs text-slate-400">Students</p></div>
                <div className="text-center"><p className={`text-xl font-bold ${d.avg>=70?'text-success-600':'text-warning-600'}`}>{d.avg}%</p><p className="text-xs text-slate-400">Avg Score</p></div>
                <div className="text-center"><p className={`text-xl font-bold ${atRiskPct>=20?'text-danger-600':'text-warning-600'}`}>{d.atRisk}</p><p className="text-xs text-slate-400">At-Risk</p></div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5"><span>Performance</span><span className="font-semibold">{d.avg}%</span></div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${d.avg>=70?'bg-success-500':'bg-warning-500'}`} style={{width:`${d.avg}%`}}></div></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
        <h2 className="font-semibold text-slate-900 mb-6">Department Score Trend (Mar–Jul)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={deptTrendData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
              <YAxis domain={[55,85]} tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius:'10px',border:'none',boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)',fontSize:'13px'}} />
              <Line type="monotone" dataKey="cse"   stroke="#6366f1" strokeWidth={2} dot={false} name="CS" />
              <Line type="monotone" dataKey="maths" stroke="#f59e0b" strokeWidth={2} dot={false} name="Maths" />
              <Line type="monotone" dataKey="phy"   stroke="#10b981" strokeWidth={2} dot={false} name="Physics" />
              <Line type="monotone" dataKey="che"   stroke="#ef4444" strokeWidth={2} dot={false} name="Chem" />
              <Line type="monotone" dataKey="ele"   stroke="#8b5cf6" strokeWidth={2} dot={false} name="Elec" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center gap-5 mt-3">
          {[['CS','#6366f1'],['Maths','#f59e0b'],['Physics','#10b981'],['Chem','#ef4444'],['Elec','#8b5cf6']].map(([name,color]) => (
            <span key={name} className="flex items-center gap-2 text-xs text-slate-500"><span className="w-3 h-0.5 rounded-full inline-block" style={{background:color}}></span>{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AdminFacultyPage({ onOpenModal, onToast }: { onOpenModal?: (type: string, data?: any) => void; onToast?: (msg: string, type?: 'success'|'warning'|'info') => void }) {
  const [search, setSearch] = useState('');
  const filtered = facultyRoster.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.dept.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={GraduationCap} title="Faculty Management" subtitle="Manage faculty accounts, course assignments, and performance.">
        <button onClick={() => onOpenModal?.('create-course', { title: 'Add Faculty' })} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"><PlusCircle className="w-4 h-4" />Add Faculty</button>
      </PageHeader>

      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 focus-within:border-brand-300 focus-within:shadow-sm transition-all max-w-md">
        <Search className="w-4 h-4 shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or department…" className="bg-transparent outline-none text-sm w-full text-slate-900 placeholder-slate-400" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50/60 text-left">
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Faculty</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Courses</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Students</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700">{f.name.split(' ').filter((_,i)=>i>0).map(w=>w[0]).join('').slice(0,2)}</div>
                      <span className="text-sm font-semibold text-slate-900">{f.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{f.dept}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{f.courses}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{f.students}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-slate-900">{f.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.status==='active'?'bg-success-50 text-success-700':'bg-warning-50 text-warning-700'}`}>{f.status}</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onToast?.(`Editing faculty ${f.name}...`, 'info')} className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onToast?.(`Faculty ${f.name} deleted`, 'warning')} className="p-1.5 text-slate-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AdminInterventionsPage({ onOpenModal, onToast }: { onOpenModal?: (type: string, data?: any) => void; onToast?: (msg: string, type?: 'success'|'warning'|'info') => void }) {
  const statusColors: Record<string, string> = {
    active:   'bg-brand-50 text-brand-700',
    pending:  'bg-warning-50 text-warning-700',
    resolved: 'bg-success-50 text-success-700',
  };
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={ShieldAlert} title="Interventions" subtitle="Cross-department intervention tracking and approval dashboard." />

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Active" value={adminInterventions.filter(i=>i.status==='active').length} color="brand" icon={Activity} />
        <SummaryCard label="Pending Approval" value={adminInterventions.filter(i=>i.status==='pending').length} color="warning" icon={Clock} />
        <SummaryCard label="Resolved" value={adminInterventions.filter(i=>i.status==='resolved').length} color="success" icon={CheckCircle2} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">All Interventions</h2>
          <button onClick={() => onToast?.("Exporting interventions CSV report...", "info")} className="flex items-center gap-2 text-xs text-brand-600 font-medium hover:underline"><Download className="w-3 h-3" />Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50/60 text-left">
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dept</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Faculty</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5"></th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {adminInterventions.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{item.student.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
                      <span className="text-sm font-semibold text-slate-900">{item.student}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">{item.dept}</span></td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.faculty}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.type}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="px-4 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[item.status]}`}>{item.status}</span></td>
                  <td className="px-6 py-4">
                    {item.status === 'pending' && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onToast?.(`Intervention approved for ${item.student}!`, "success")} className="p-1.5 bg-success-50 text-success-600 rounded-lg hover:bg-success-100 transition-colors"><UserCheck className="w-3.5 h-3.5" /></button>
                        <button onClick={() => onToast?.(`Intervention rejected for ${item.student}`, "warning")} className="p-1.5 bg-danger-50 text-danger-600 rounded-lg hover:bg-danger-100 transition-colors"><UserX className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AdminAnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <PageHeader icon={BarChart2} title="Institution Analytics" subtitle="Comprehensive performance analytics across all departments and cohorts." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">Institution Score Distribution</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsScoreDist} margin={{top:0,right:0,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:'10px',border:'none',boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)',fontSize:'13px'}} />
                <Bar dataKey="count" radius={[4,4,0,0]} barSize={32}>
                  {analyticsScoreDist.map((_,i)=><Cell key={i} fill={i<2?'#10b981':i<4?'#f59e0b':'#ef4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">Department Score Trends</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deptTrendData} margin={{top:0,right:0,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <YAxis domain={[55,85]} tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius:'10px',border:'none',boxShadow:'0 8px 24px -4px rgb(0 0 0/0.12)',fontSize:'13px'}} />
                <Line type="monotone" dataKey="cse" stroke="#6366f1" strokeWidth={2} dot={false} name="CS" />
                <Line type="monotone" dataKey="maths" stroke="#f59e0b" strokeWidth={2} dot={false} name="Maths" />
                <Line type="monotone" dataKey="phy" stroke="#10b981" strokeWidth={2} dot={false} name="Physics" />
                <Line type="monotone" dataKey="che" stroke="#ef4444" strokeWidth={2} dot={false} name="Chem" />
                <Line type="monotone" dataKey="ele" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Elec" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Department Performance Summary</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50/60 text-left">
              <th className="px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Students</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Score</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">At-Risk</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Score Bar</th>
              <th className="px-4 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trend</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {departmentData.map(row => {
                const atRiskPct = Math.round(row.atRisk/row.students*100);
                const positive = row.trend >= 0;
                return (
                  <tr key={row.dept} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center"><Building2 className="w-4 h-4 text-brand-500" /></div>
                        <span className="text-sm font-semibold text-slate-900">{row.dept}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{row.students.toLocaleString()}</td>
                    <td className="px-4 py-4"><span className={`text-sm font-bold ${row.avg>=70?'text-success-600':'text-warning-600'}`}>{row.avg}%</span></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${atRiskPct>=20?'text-danger-600':'text-warning-600'}`}>{row.atRisk}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${atRiskPct>=20?'bg-danger-50 text-danger-600':'bg-warning-50 text-warning-600'}`}>{atRiskPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 w-40">
                      <div className="flex h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className={`rounded-full ${row.avg>=70?'bg-success-500':'bg-warning-500'}`} style={{width:`${row.avg}%`}}></div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center gap-1 text-sm font-semibold ${positive?'text-success-600':'text-danger-600'}`}>
                        {positive?<ArrowUpRight className="w-4 h-4"/>:<ArrowDownRight className="w-4 h-4"/>}
                        {positive?'+':''}{row.trend}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function AdminSettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [autoIntervene, setAutoIntervene] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState('65');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader icon={Settings} title="System Settings" subtitle="Configure platform behaviour, notifications, and risk parameters." />

      {/* Risk thresholds */}
      <SettingsCard title="Risk Detection" description="Configure thresholds that trigger at-risk classification.">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-800">Score risk threshold</p><p className="text-xs text-slate-400 mt-0.5">Students below this score are flagged at-risk</p></div>
            <div className="flex items-center gap-2">
              <input type="number" value={riskThreshold} onChange={e=>setRiskThreshold(e.target.value)} className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-center outline-none focus:border-brand-400" />
              <span className="text-sm text-slate-500">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-800">Attendance risk threshold</p><p className="text-xs text-slate-400 mt-0.5">Students below this attendance are flagged</p></div>
            <div className="flex items-center gap-2"><input type="number" defaultValue={75} className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-center outline-none focus:border-brand-400" /><span className="text-sm text-slate-500">%</span></div>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-800">Auto-create interventions</p><p className="text-xs text-slate-400 mt-0.5">Automatically create intervention when risk is detected</p></div>
            <Toggle value={autoIntervene} onChange={setAutoIntervene} />
          </div>
        </div>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard title="Notifications" description="Manage how and when alerts are delivered to faculty and students.">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-800">Email notifications</p><p className="text-xs text-slate-400 mt-0.5">Send alerts and reports via email</p></div>
            <Toggle value={emailNotifs} onChange={setEmailNotifs} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-800">SMS alerts</p><p className="text-xs text-slate-400 mt-0.5">Send urgent alerts via SMS to faculty</p></div>
            <Toggle value={smsAlerts} onChange={setSmsAlerts} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-slate-800">Notification frequency</p><p className="text-xs text-slate-400 mt-0.5">How often to batch and send digest reports</p></div>
            <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-brand-400 bg-white">
              <option>Daily</option><option>Weekly</option><option>Immediately</option>
            </select>
          </div>
        </div>
      </SettingsCard>

      {/* Academic year */}
      <SettingsCard title="Academic Calendar" description="Set the current academic year and semester boundaries.">
        <div className="grid grid-cols-2 gap-4">
          {[['Academic Year','2025–2026'],['Current Semester','Semester 2'],['Semester Start','July 1, 2025'],['Semester End','Nov 30, 2025']].map(([label,val]) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
              <input defaultValue={val} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-brand-400" />
            </div>
          ))}
        </div>
      </SettingsCard>

      <div className="flex justify-end gap-3">
        <button onClick={() => onToast?.("Changes discarded", "info")} className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Discard Changes</button>
        <button onClick={() => onToast?.("System Configuration Saved!", "success")} className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20">Save Settings</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function PageHeader({ icon: Icon, title, subtitle, children }: { icon: React.ElementType; title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-6 h-6 text-brand-500" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
        <p className="text-slate-500">{subtitle}</p>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-brand-600' : 'bg-slate-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`}></span>
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 text-center">
      <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value, color, icon: Icon }: { label: string; value: number | string; color: 'brand'|'warning'|'success'|'danger'; icon: React.ElementType }) {
  const c = { brand:'bg-brand-50 text-brand-600', warning:'bg-warning-50 text-warning-600', success:'bg-success-50 text-success-600', danger:'bg-danger-50 text-danger-600' }[color];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c}`}><Icon className="w-5 h-5" /></div>
      <div><p className="text-2xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p></div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = { pending:'bg-warning-50 text-warning-700', submitted:'bg-brand-50 text-brand-700', graded:'bg-success-50 text-success-700', upcoming:'bg-brand-50 text-brand-700' };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${m[status]}`}>{status}</span>;
}

function PulseStat({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col">
      <span className="text-white/50 text-xs font-medium uppercase tracking-wider mb-0.5">{label}</span>
      <span className="text-white font-bold text-lg flex items-center gap-1">{Icon && <Icon className="w-4 h-4 text-orange-300" />}{value}</span>
    </div>
  );
}

function StudentStatCard({ label, value, sub, accent, icon: Icon }: { label: string; value: string; sub: string; accent: 'warning'|'success'|'danger'; icon: React.ElementType }) {
  const m = { warning:{text:'text-warning-600',iconBg:'bg-warning-100'}, success:{text:'text-success-600',iconBg:'bg-success-50'}, danger:{text:'text-danger-600',iconBg:'bg-danger-50'} }[accent];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${m.iconBg} flex items-center justify-center shrink-0`}><Icon className={`w-5 h-5 ${m.text}`} /></div>
      <div className="flex-1 min-w-0"><p className="text-xs text-slate-400 font-medium truncate">{label}</p><p className="text-xl font-bold text-slate-900 leading-tight">{value}</p><p className={`text-xs font-medium ${m.text} mt-0.5`}>{sub}</p></div>
    </div>
  );
}

function RiskMetric({ label, value, color }: { label: string; value: number; color: string }) {
  const c: Record<string,string> = { danger:'text-danger-600', warning:'text-warning-600', success:'text-success-600' };
  return (
    <div className="flex-1 text-center">
      <p className={`text-4xl font-bold tracking-tight mb-1 ${c[color]}`}>{value}</p>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function DataPoint({ label, value, status, icon: Icon }: { label: string; value: string; status: string; icon?: React.ElementType }) {
  const m: Record<string,string> = { danger:'bg-danger-50 border-danger-100 text-danger-700', warning:'bg-warning-50 border-warning-100 text-warning-700', success:'bg-success-50 border-success-100 text-success-700', neutral:'bg-slate-50 border-slate-100 text-slate-700' };
  return (
    <div className={`px-4 py-3 rounded-xl border ${m[status]} flex items-center justify-between`}>
      <span className="text-sm font-medium opacity-80">{label}</span>
      <span className="font-bold flex items-center gap-1.5">{Icon && <Icon className="w-4 h-4" />}{value}</span>
    </div>
  );
}

function KpiCard({ label, value, delta, deltaDir, icon: Icon, accent }: { label: string; value: string; delta: string; deltaDir: 'up'|'down'; icon: React.ElementType; accent: 'brand'|'danger'|'success' }) {
  const m: Record<string,{text:string;iconBg:string}> = { brand:{text:'text-brand-600',iconBg:'bg-brand-100'}, danger:{text:'text-danger-600',iconBg:'bg-danger-100'}, success:{text:'text-success-600',iconBg:'bg-success-50'} }[accent] as any;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 lg:p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${m.iconBg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${m.text}`} /></div>
      </div>
      <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{value}</p>
      <p className={`text-xs font-medium ${deltaDir==='up'?'text-success-600':'text-danger-600'}`}>{delta}</p>
    </div>
  );
}

function AlertDot({ type }: { type: string }) {
  const m: Record<string,string> = { critical:'bg-danger-500', warning:'bg-warning-500', info:'bg-brand-400', success:'bg-success-500' };
  return (
    <div className="mt-1 shrink-0">
      <span className="relative flex h-2.5 w-2.5">
        {(type==='critical'||type==='warning') && <span className={`animate-ping absolute h-full w-full rounded-full opacity-60 ${m[type]}`}></span>}
        <span className={`relative h-2.5 w-2.5 rounded-full ${m[type]}`}></span>
      </span>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
      <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5 text-white" /></div>
      {label}
    </div>
  );
}
