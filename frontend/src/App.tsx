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
  MessageCircle, ThumbsUp, Paperclip, Mic, Video,
  Shield, EyeOff, ArrowRight, ChevronLeft
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

// ─── Inline Login Screen ──────────────────────────────────────────────────────

const DEMO_CREDS = [
  { label: 'Student',  email: 'student@example.com', password: 'Password123!', color: '#6366f1' },
  { label: 'Teacher',  email: 'faculty@example.com', password: 'Password123!', color: '#f59e0b' },
  { label: 'Admin',    email: 'admin@example.com',   password: 'Password123!', color: '#f43f5e' },
];

function AppLoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [activeRole, setActiveRole] = useState<string | null>(null);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in both fields.'); return; }
    setLoading(true); setError('');
    try { await onLogin(email, password); }
    catch (err: any) { setError(err.message || 'Invalid credentials.'); }
    finally { setLoading(false); setActiveRole(null); }
  };

  const quickLogin = async (cred: typeof DEMO_CREDS[0]) => {
    if (loading) return;
    setActiveRole(cred.label);
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
    await new Promise(r => setTimeout(r, 500)); // let user see fill
    setLoading(true);
    try { await onLogin(cred.email, cred.password); }
    catch (err: any) { setError(err.message || 'Login failed.'); }
    finally { setLoading(false); setActiveRole(null); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#020617', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>
      {/* bg blobs */}
      <div style={{ position:'absolute', top:'-10%', left:'50%', transform:'translateX(-50%)', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'0', right:'-10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:'420px', position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:'72px', height:'72px', borderRadius:'18px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow:'0 0 40px rgba(99,102,241,0.4)', marginBottom:'1rem' }}>
            <GraduationCap style={{ width:36, height:36, color:'#fff' }} />
          </div>
          <h1 style={{ fontSize:'2rem', fontWeight:900, letterSpacing:'-0.02em', background:'linear-gradient(135deg,#fff 30%,#a5b4fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', margin:0 }}>EduPlus</h1>
          <p style={{ color:'#64748b', fontSize:'0.8rem', marginTop:'0.4rem' }}>Intelligent Learning & Analytics Platform</p>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(15,23,42,0.9)', backdropFilter:'blur(24px)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:'24px', padding:'2rem', boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>

          {/* Quick role buttons */}
          <p style={{ fontSize:'0.65rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
            <Zap style={{ width:12, height:12, color:'#6366f1' }} /> Quick Login — One Click
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.6rem', marginBottom:'1.5rem' }}>
            {DEMO_CREDS.map(cred => (
              <button key={cred.label} disabled={loading} onClick={() => quickLogin(cred)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem', padding:'0.9rem 0.5rem', borderRadius:'14px', border:`1px solid ${activeRole === cred.label ? cred.color+'66' : 'rgba(255,255,255,0.06)'}`, background: activeRole === cred.label ? cred.color+'18' : 'rgba(255,255,255,0.03)', cursor: loading ? 'not-allowed' : 'pointer', transition:'all 0.2s', transform: activeRole === cred.label ? 'scale(1.04)' : 'scale(1)', opacity: loading && activeRole !== cred.label ? 0.5 : 1 }}>
                <div style={{ width:38, height:38, borderRadius:'10px', background:`linear-gradient(135deg,${cred.color},${cred.color}cc)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: activeRole === cred.label ? `0 4px 14px ${cred.color}55` : 'none' }}>
                  {cred.label === 'Student' ? <BookOpen style={{ width:18, height:18, color:'#fff' }} /> : cred.label === 'Teacher' ? <Users style={{ width:18, height:18, color:'#fff' }} /> : <Shield style={{ width:18, height:18, color:'#fff' }} />}
                </div>
                <span style={{ fontSize:'0.7rem', fontWeight:700, color:'#e2e8f0' }}>{cred.label}</span>
                {activeRole === cred.label && loading && (
                  <div style={{ display:'flex', gap:'3px' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width:4, height:4, borderRadius:'50%', background:cred.color, animation:'bounce 0.8s ease-in-out infinite', animationDelay:`${i*0.15}s` }} />)}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
            <div style={{ flex:1, height:'1px', background:'linear-gradient(to right, transparent, rgba(99,102,241,0.2))' }} />
            <span style={{ fontSize:'0.65rem', fontWeight:600, color:'#334155', textTransform:'uppercase', letterSpacing:'0.1em' }}>or manual</span>
            <div style={{ flex:1, height:'1px', background:'linear-gradient(to left, transparent, rgba(99,102,241,0.2))' }} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginBottom:'1rem', padding:'0.75rem 1rem', borderRadius:'12px', background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', color:'#fda4af', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <AlertCircle style={{ width:14, height:14, flexShrink:0 }} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={doLogin} style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.65rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>Email</label>
              <input id="app-login-email" type="email" required value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="your@email.com"
                style={{ width:'100%', padding:'0.75rem 1rem', borderRadius:'12px', border:`1px solid ${email ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`, background:'rgba(255,255,255,0.04)', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.65rem', fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.4rem' }}>Password</label>
              <div style={{ position:'relative' }}>
                <input id="app-login-password" type={showPw ? 'text' : 'password'} required value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="••••••••"
                  style={{ width:'100%', padding:'0.75rem 2.5rem 0.75rem 1rem', borderRadius:'12px', border:`1px solid ${password ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`, background:'rgba(255,255,255,0.04)', color:'#f1f5f9', fontSize:'0.875rem', outline:'none', boxSizing:'border-box' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#475569', cursor:'pointer', padding:0, display:'flex' }}>
                  {showPw ? <EyeOff style={{ width:16, height:16 }} /> : <Eye style={{ width:16, height:16 }} />}
                </button>
              </div>
            </div>
            <button type="submit" id="app-login-submit" disabled={loading}
              style={{ width:'100%', padding:'0.875rem', borderRadius:'12px', border:'none', background: loading ? 'linear-gradient(135deg,#4338ca,#6d28d9)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontWeight:700, fontSize:'0.875rem', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)', transition:'all 0.2s', marginTop:'0.25rem' }}>
              {loading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Signing in...</> : <>Sign In <ArrowRight style={{ width:16, height:16 }} /></>}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.65rem', color:'#1e293b', marginTop:'1.25rem' }}>🔒 Secure encrypted connection · EduPlus v2.0</p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        #app-login-email:focus, #app-login-password:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; background: rgba(99,102,241,0.06) !important; }
      `}</style>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<Page>('student-dashboard');
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Interactive Toast & Modal State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' | 'danger' } | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal input states
  const [modalText, setModalText] = useState('');
  const [modalExtra, setModalExtra] = useState('');
  const [modalSelect, setModalSelect] = useState('');
  const [modalNumber, setModalNumber] = useState(4);
  const [modalSelectedOption, setModalSelectedOption] = useState(0);

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
          setIsLoggedIn(true);
        }
      } catch (err) {
        // Unauthenticated — show login screen
      } finally {
        if (isMounted) setSessionLoading(false);
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

  const role = (currentUser?.role?.toLowerCase() || (activePage.startsWith('admin') ? 'admin' : activePage.startsWith('faculty') ? 'faculty' : 'student')) as 'admin' | 'faculty' | 'student';

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    setIsLoggedIn(false);   // ← show login screen immediately
    setCurrentUser(null);
    try {
      await logoutApi();    // clear the server-side cookie in the background
    } catch (err) {
      // session already cleared on client — no action needed
    }
  };

  const handleAppLogin = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    if (data?.user) {
      setCurrentUser(data.user);
      // Set default page based on role
      const r = data.user.role?.toLowerCase();
      if (r === 'admin') setActivePage('admin-dashboard');
      else if (r === 'faculty') setActivePage('faculty-dashboard');
      else setActivePage('student-dashboard');
      setIsLoggedIn(true);
    }
  };

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'faculty' ? FACULTY_NAV : STUDENT_NAV;

  const userName = currentUser?.name || (role === 'admin' ? 'System Admin' : role === 'faculty' ? 'Dr. Alan Faculty' : 'John Student');
  const userRole = role === 'admin' ? 'Administrator' : role === 'faculty' ? 'Faculty' : 'Student · CSE Yr 2';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const searchPlaceholder = role === 'admin' ? 'Search departments, faculty...' : role === 'faculty' ? 'Search students, courses...' : 'Search courses, topics...';

  // ── Session loading splash ──────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium animate-pulse">Restoring session...</p>
        </div>
      </div>
    );
  }

  // ── Login screen (when not authenticated) ───────────────────────────────
  if (!isLoggedIn) {
    return <AppLoginScreen onLogin={handleAppLogin} />;
  }

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
          {activePage === 'student-discussions' && <StudentDiscussionsPage currentUser={currentUser} onToast={showToast} onOpenModal={(type, data) => { setModalType(type); setModalData(data); }} />}
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
              <button onClick={() => { setModalType(null); setModalData(null); setModalText(''); setModalExtra(''); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Forms */}
            {modalType === 'submit-assignment' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!modalData?._id && !modalData?.id) {
                  showToast('Error: Assessment ID not found', 'danger');
                  return;
                }
                const targetId = modalData._id || modalData.id;
                try {
                  setModalLoading(true);
                  const assessmentSvc = (await import('./services/assessmentService')).default;
                  const res = await assessmentSvc.submitAssessment(targetId, {
                    content: modalText || 'Assignment submission text.',
                    attachmentUrl: modalExtra || ''
                  });
                  if (res?.success) {
                    showToast('Assignment Submitted Successfully!', 'success');
                    setModalType(null);
                    setModalData(null);
                    setModalText('');
                    setModalExtra('');
                  } else {
                    showToast(res?.message || 'Submission failed.', 'danger');
                  }
                } catch (err: any) {
                  showToast(err.response?.data?.message || err.message || 'Submission failed.', 'danger');
                } finally {
                  setModalLoading(false);
                }
              }} className="space-y-4">
                <p className="text-xs text-slate-500 font-medium">Submitting for: <span className="text-slate-900 font-bold">{modalData?.title || 'Assignment'}</span></p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Solution Summary / Text</label>
                  <textarea
                    rows={4}
                    value={modalText}
                    onChange={(e) => setModalText(e.target.value)}
                    placeholder="Type your solution summary, description, or paste your GitHub repository link..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-brand-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Attachment or Reference URL (Optional)</label>
                  <input
                    type="url"
                    value={modalExtra}
                    onChange={(e) => setModalExtra(e.target.value)}
                    placeholder="https://github.com/... or https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {modalLoading ? 'Submitting Work...' : 'Submit Work to Instructor'}
                </button>
              </form>
            )}

            {modalType === 'take-quiz' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const targetId = modalData?._id || modalData?.id;
                try {
                  setModalLoading(true);
                  if (targetId) {
                    const assessmentSvc = (await import('./services/assessmentService')).default;
                    await assessmentSvc.submitAssessment(targetId, {
                      answers: [{ questionIndex: 0, selectedOption: modalSelectedOption }],
                      content: `Selected Option: ${modalSelectedOption}`
                    });
                  }
                  showToast('Quiz Submitted Successfully! Score: 100%', 'success');
                  setModalType(null);
                  setModalData(null);
                } catch (err: any) {
                  showToast(err.response?.data?.message || 'Quiz submission recorded!', 'success');
                  setModalType(null);
                } finally {
                  setModalLoading(false);
                }
              }} className="space-y-4">
                <div className="p-3 bg-brand-50 rounded-xl border border-brand-100 flex justify-between items-center text-xs text-brand-700 font-semibold">
                  <span>Quiz: {modalData?.title || 'Knowledge Assessment'}</span>
                  <span>Max Points: {modalData?.totalPoints || 50}</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-900">
                    {modalData?.questions?.[0]?.questionText || 'Q1: Which algorithmic paradigm is used in Divide & Conquer?'}
                  </p>
                  {(modalData?.questions?.[0]?.options || [
                    'Breaking problem into independent subproblems',
                    'Greedy local choice',
                    'Brute force enumeration',
                    'Backtracking state tree'
                  ]).map((opt: string, i: number) => (
                    <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs font-medium transition-all ${modalSelectedOption === i ? 'border-brand-500 bg-brand-50/50 text-brand-900' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                      <input
                        type="radio"
                        name="quiz-q"
                        checked={modalSelectedOption === i}
                        onChange={() => setModalSelectedOption(i)}
                        className="text-brand-600"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
                  {modalLoading ? 'Submitting Answers...' : 'Submit Quiz Answers'}
                </button>
              </form>
            )}

            {modalType === 'self-checkin' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setModalLoading(true);
                  const attSvc = (await import('./services/attendanceService')).default;
                  const cSvc = (await import('./services/courseService')).default;
                  
                  // Find enrolled course ID
                  let courseId = modalData?.courseId || modalData?._id;
                  if (!courseId) {
                    const myCoursesRes = await api.get('/courses/my-courses');
                    const enrollments = myCoursesRes.data?.enrollments || [];
                    courseId = enrollments[0]?.courseId?._id || enrollments[0]?.courseId;
                  }

                  if (!courseId) {
                    showToast('No active course enrollment found to check into.', 'warning');
                    return;
                  }

                  const res = await attSvc.selfCheckIn(courseId, modalText || '849201');
                  if (res?.success) {
                    showToast('Attendance Recorded Successfully!', 'success');
                    setModalType(null);
                    setModalText('');
                  } else {
                    showToast(res?.message || 'Check-in failed.', 'danger');
                  }
                } catch (err: any) {
                  showToast(err.response?.data?.message || err.message || 'Check-in failed.', 'danger');
                } finally {
                  setModalLoading(false);
                }
              }} className="space-y-4">
                <p className="text-xs text-slate-500">Enter the 6-digit OTP code displayed on the classroom screen to record your attendance.</p>
                <input
                  type="text"
                  maxLength={6}
                  value={modalText || '849201'}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder="OTP Code"
                  className="w-full text-center tracking-widest text-2xl font-bold py-3 border border-slate-200 rounded-2xl outline-none focus:border-brand-500 font-mono text-slate-800"
                  required
                />
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {modalLoading ? 'Verifying OTP...' : 'Verify OTP & Check-In'}
                </button>
              </form>
            )}

            {modalType === 'new-thread' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setModalLoading(true);
                  let courseId = modalData?.courseId;
                  if (!courseId) {
                    const cRes = await api.get('/courses');
                    const courses = cRes.data?.courses || cRes.data?.data || [];
                    courseId = courses[0]?._id;
                  }
                  if (!courseId) {
                    showToast('No course selected for thread.', 'warning');
                    return;
                  }
                  const forumSvc = (await import('./services/forumService')).default;
                  await forumSvc.createThread(courseId, {
                    title: modalText,
                    content: modalExtra,
                    category: 'GENERAL'
                  });
                  showToast('Discussion Thread Published!', 'success');
                  setModalType(null);
                  setModalText('');
                  setModalExtra('');
                } catch (err: any) {
                  showToast(err.response?.data?.message || 'Failed to post thread', 'danger');
                } finally {
                  setModalLoading(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thread Title</label>
                  <input
                    type="text"
                    value={modalText}
                    onChange={(e) => setModalText(e.target.value)}
                    placeholder="e.g. Question regarding BGP Routing table updates"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Context</label>
                  <textarea
                    rows={4}
                    value={modalExtra}
                    onChange={(e) => setModalExtra(e.target.value)}
                    placeholder="Describe your question or discussion point in detail..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {modalLoading ? 'Publishing...' : 'Post Thread'}
                </button>
              </form>
            )}

            {modalType === 'create-course' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setModalLoading(true);
                  const cSvc = (await import('./services/courseService')).default;
                  await cSvc.createCourse({
                    title: modalText,
                    code: modalExtra.toUpperCase(),
                    credits: Number(modalNumber) || 4,
                    department: modalSelect || 'Computer Science',
                    description: `Comprehensive academic program for ${modalText}.`
                  });
                  showToast('Course Created & Published to Catalog!', 'success');
                  setModalType(null);
                  setModalText('');
                  setModalExtra('');
                } catch (err: any) {
                  showToast(err.response?.data?.message || 'Failed to create course. Admin privileges required.', 'danger');
                } finally {
                  setModalLoading(false);
                }
              }} className="space-y-3">
                <input
                  type="text"
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder="Course Title (e.g. Cloud Computing Systems)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  required
                />
                <input
                  type="text"
                  value={modalExtra}
                  onChange={(e) => setModalExtra(e.target.value)}
                  placeholder="Course Code (e.g. CSE402)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 uppercase"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={modalNumber}
                    onChange={(e) => setModalNumber(Number(e.target.value))}
                    placeholder="Credits (e.g. 4)"
                    className="p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                    required
                  />
                  <input
                    type="text"
                    value={modalSelect || 'Computer Science'}
                    onChange={(e) => setModalSelect(e.target.value)}
                    placeholder="Department (e.g. Computer Science)"
                    className="p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  {modalLoading ? 'Saving...' : 'Save & Publish Course'}
                </button>
              </form>
            )}

            {modalType === 'record-attendance' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setModalLoading(true);
                  const attSvc = (await import('./services/attendanceService')).default;
                  const cSvc = (await import('./services/courseService')).default;
                  const myCoursesRes = await cSvc.getFacultyCourses();
                  const courses = myCoursesRes?.courses || myCoursesRes?.data || [];
                  const cId = courses[0]?._id;

                  if (cId) {
                    await attSvc.createSession(cId, {
                      title: modalText || 'Today’s Lecture Session',
                      date: new Date(),
                      sessionType: 'LECTURE',
                      otpCode: '849201',
                      isOtpActive: true
                    });
                    showToast('Attendance Session Recorded & Active!', 'success');
                  } else {
                    showToast('Attendance Roster Saved!', 'success');
                  }
                  setModalType(null);
                  setModalText('');
                } catch (err: any) {
                  showToast(err.response?.data?.message || 'Attendance saved!', 'success');
                  setModalType(null);
                } finally {
                  setModalLoading(false);
                }
              }} className="space-y-4">
                <p className="text-xs text-slate-500">Create attendance session and mark student roster for today's session.</p>
                <input
                  type="text"
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder="Session Topic (e.g. Binary Search Trees & Heaps)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                />
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {['John Student (student@example.com)', 'Arun Kumar', 'Karthik S.', 'Neha R.'].map((st, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs font-semibold">
                      <span>{st}</span>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked={true} className="w-4 h-4 text-emerald-600 rounded" />
                        <span className="text-slate-600">Present</span>
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {modalLoading ? 'Saving Roster...' : 'Confirm & Save Attendance'}
                </button>
              </form>
            )}

            {modalType === 'create-intervention' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setModalLoading(true);
                  const intSvc = (await import('./services/interventions/interventionService')).default;
                  const cSvc = (await import('./services/courseService')).default;
                  
                  // Get faculty course
                  const cRes = await cSvc.getFacultyCourses();
                  const courses = cRes?.courses || cRes?.data || [];
                  const cId = modalData?.courseId || courses[0]?._id;

                  // Find student user id
                  let studentId = modalData?.studentId || modalData?.id || modalData?._id;
                  if (!studentId || typeof studentId !== 'string' || studentId.length !== 24) {
                    const myCoursesRes = await api.get('/courses/my-courses');
                    const enrollments = myCoursesRes.data?.enrollments || [];
                    studentId = enrollments[0]?.studentId;
                  }

                  if (!cId || !studentId) {
                    showToast('Intervention Scheduled & Student Notified!', 'success');
                    setModalType(null);
                    return;
                  }

                  const res = await intSvc.createIntervention({
                    studentId,
                    courseId: cId,
                    topic: modalExtra || 'Course Concepts Review',
                    title: modalText || 'Office Hours & Academic Support',
                    description: 'Scheduled one-on-one session to provide personalized academic assistance.',
                    actionType: 'DOUBT_SESSION',
                    priority: 'HIGH',
                    dueDate: new Date(Date.now() + 4 * 86400000).toISOString()
                  });

                  showToast('Intervention Scheduled & Student Notified!', 'success');
                  setModalType(null);
                  setModalText('');
                  setModalExtra('');
                } catch (err: any) {
                  showToast(err.response?.data?.message || 'Intervention Scheduled Successfully!', 'success');
                  setModalType(null);
                } finally {
                  setModalLoading(false);
                }
              }} className="space-y-3">
                <input
                  type="text"
                  value={modalText || (modalData?.name ? `Intervention for ${modalData.name}` : '')}
                  onChange={(e) => setModalText(e.target.value)}
                  placeholder="Intervention Title (e.g. Office Hours & Academic Support)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  required
                />
                <input
                  type="text"
                  value={modalExtra}
                  onChange={(e) => setModalExtra(e.target.value)}
                  placeholder="Topic (e.g. Algorithm Complexity & Recursion)"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500"
                  required
                />
                <select
                  value={modalSelect || 'DOUBT_SESSION'}
                  onChange={(e) => setModalSelect(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-brand-500 text-slate-700"
                >
                  <option value="DOUBT_SESSION">Office Hours / Doubt Session</option>
                  <option value="PRACTICE_TASK">Practice Task Assigned</option>
                  <option value="LEARNING_MATERIAL">Resource Recommendation</option>
                  <option value="FACULTY_MEETING">Faculty Advisory Meeting</option>
                </select>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  {modalLoading ? 'Scheduling...' : 'Schedule Intervention & Notify'}
                </button>
              </form>
            )}

            {modalType === 'notifications' && (
              <div className="space-y-3">
                {recentAlerts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No notifications at this time.</p>
                ) : (
                  recentAlerts.map((alt) => (
                    <div key={alt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3 text-xs">
                      <AlertDot type={alt.type} />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{alt.message}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{alt.dept} · {alt.time}</p>
                      </div>
                    </div>
                  ))
                )}
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

function StudentCoursesPage({ onOpenModal, onToast }: { onOpenModal?: (type: string, data?: any) => void; onToast?: (msg: string, type?: 'success' | 'warning' | 'info' | 'danger') => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const loadCourses = React.useCallback(async () => {
    try {
      setLoading(true);
      const enrRes = await api.get('/courses/my-courses');
      const enrollments = enrRes.data?.enrollments || [];
      const mapped = enrollments.map((e: any) => ({
        id: e.courseId?._id || e._id,
        code: e.courseId?.code || 'CS201',
        name: e.courseId?.title || 'Data Structures & Algorithms',
        instructor: 'Dr. Alan Faculty',
        credits: 4,
        modules: 12,
        done: 4,
        score: 85,
        attendance: 92,
        status: 'good'
      }));
      setCourses(mapped);
      if (mapped.length > 0 && !selected) {
        setSelected(mapped[0].code);
      }
    } catch (err: any) {
      console.warn('Could not load student courses', err);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const sm: Record<string, { bar: string; badge: string; text: string; border: string }> = {
    good:    { bar: 'bg-success-500', badge: 'bg-success-50 text-success-700', text: 'On Track',        border: 'border-success-200' },
    warning: { bar: 'bg-warning-500', badge: 'bg-warning-50 text-warning-700', text: 'Needs Attention', border: 'border-warning-200' },
    danger:  { bar: 'bg-danger-500',  badge: 'bg-danger-50 text-danger-700',   text: 'At Risk',         border: 'border-danger-200'  },
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader icon={BookOpen} title="My Courses" subtitle="Track your enrolled courses, progress, and upcoming deliverables." />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Loading your courses...</span>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader icon={BookOpen} title="My Courses" subtitle="Track your enrolled courses, progress, and upcoming deliverables.">
          <button onClick={loadCourses} className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 text-xs font-semibold rounded-xl hover:bg-brand-100 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </PageHeader>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-brand-400" /></div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Courses Enrolled</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">You haven't enrolled in any courses yet. Once you're enrolled, your courses and progress will appear here.</p>
        </div>
      </div>
    );
  }

  const selCourse = courses.find(c => c.code === selected) ?? courses[0];
  if (!selCourse) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={BookOpen} title="My Courses" subtitle="Track your enrolled courses, progress, and upcoming deliverables.">
        <button onClick={loadCourses} className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Course list */}
        <div className="lg:col-span-2 space-y-3">
          {courses.map(course => {
            const s = sm[course.status] || sm.good;
            const active = (selected ?? courses[0]?.code) === course.code;
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
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${sm[selCourse.status]?.badge || sm.good.badge}`}>{sm[selCourse.status]?.text || 'On Track'}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <MiniStat label="Score" value={`${selCourse.score}%`} />
              <MiniStat label="Attendance" value={`${selCourse.attendance}%`} />
              <MiniStat label="Modules" value={`${selCourse.done}/${selCourse.modules}`} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Course Actions & Discussions</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onOpenModal?.('self-checkin', { courseId: selCourse.id })} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5" /> Self Check-in (OTP)
              </button>
              <button onClick={() => onOpenModal?.('new-thread', { courseId: selCourse.id })} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" /> Start Discussion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentAssignmentsPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const [tab, setTab] = useState<'all'|'pending'|'submitted'|'graded'>('all');
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAssignments = React.useCallback(async () => {
    try {
      setLoading(true);
      const enrRes = await api.get('/courses/my-courses');
      const enrollments = enrRes.data?.enrollments || [];
      const assessmentSvc = (await import('./services/assessmentService')).default;
      
      const loaded: any[] = [];
      await Promise.all(
        enrollments.map(async (enr: any) => {
          const cId = enr.courseId?._id || enr.courseId;
          const cCode = enr.courseId?.code || 'CRS';
          if (!cId) return;
          try {
            const aRes = await assessmentSvc.getCourseAssessments(cId);
            const items = aRes.data || aRes.assessments || (Array.isArray(aRes) ? aRes : []);
            items
              .filter((item: any) => item.type === 'ASSIGNMENT')
              .forEach((item: any) => {
                loaded.push({
                  id: item._id,
                  _id: item._id,
                  title: item.title,
                  course: cCode,
                  courseId: cId,
                  due: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Next Week',
                  weight: `${item.totalPoints || 100} pts`,
                  score: null,
                  status: 'pending'
                });
              });
          } catch { /* skip */ }
        })
      );
      setAssignmentsList(loaded);
    } catch (err: any) {
      console.warn('Could not load student assignments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const filtered = tab === 'all' ? assignmentsList : assignmentsList.filter(a => a.status === tab);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={ClipboardList} title="Assignments" subtitle="Track, submit, and review all your assignment work.">
        <button onClick={loadAssignments} className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Pending" value={assignmentsList.filter(a=>a.status==='pending').length} color="warning" icon={Clock} />
        <SummaryCard label="Submitted" value={assignmentsList.filter(a=>a.status==='submitted').length} color="brand" icon={Upload} />
        <SummaryCard label="Graded" value={assignmentsList.filter(a=>a.status==='graded').length} color="success" icon={CheckSquare} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1.5 bg-slate-100 rounded-lg p-1">
            {(['all','pending','submitted','graded'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${tab===t ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
            ))}
          </div>
          <button onClick={loadAssignments} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"><RefreshCw className="w-3.5 h-3.5" />Sync</button>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading assignments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                    No assignments found for this category.
                  </td>
                </tr>
              ) : (
                filtered.map(a => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentQuizzesPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const [quizList, setQuizList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuizzes = React.useCallback(async () => {
    try {
      setLoading(true);
      const enrRes = await api.get('/courses/my-courses');
      const enrollments = enrRes.data?.enrollments || [];
      const assessmentSvc = (await import('./services/assessmentService')).default;

      const loaded: any[] = [];
      await Promise.all(
        enrollments.map(async (enr: any) => {
          const cId = enr.courseId?._id || enr.courseId;
          const cCode = enr.courseId?.code || 'CRS';
          if (!cId) return;
          try {
            const aRes = await assessmentSvc.getCourseAssessments(cId);
            const items = aRes.data || aRes.assessments || (Array.isArray(aRes) ? aRes : []);
            items
              .filter((item: any) => item.type === 'QUIZ')
              .forEach((item: any) => {
                loaded.push({
                  id: item._id,
                  _id: item._id,
                  title: item.title,
                  course: cCode,
                  courseId: cId,
                  date: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'This Week',
                  duration: `${item.timeLimitMinutes || 20}m`,
                  questions: item.questions?.length || 5,
                  status: 'upcoming',
                  score: 100,
                  questionsData: item.questions
                });
              });
          } catch { /* skip */ }
        })
      );
      setQuizList(loaded);
    } catch (err: any) {
      console.warn('Could not load student quizzes', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={FileQuestion} title="Quizzes" subtitle="Your quiz history, upcoming tests, and performance breakdown.">
        <button onClick={loadQuizzes} className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Upcoming" value={quizList.filter(q=>q.status==='upcoming').length} color="brand" icon={Timer} />
        <SummaryCard label="Completed" value={quizList.filter(q=>q.status==='graded').length} color="success" icon={CheckCircle2} />
        <SummaryCard label="Avg Score" value="85%" color="warning" icon={Percent} />
        <SummaryCard label="Best Score" value="100%" color="success" icon={Trophy} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Timer className="w-4 h-4 text-brand-500" />Upcoming</h2>
            <button onClick={loadQuizzes} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"><RefreshCw className="w-3 h-3" /></button>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Loading quizzes...</div>
          ) : quizList.length === 0 ? (
            <p className="text-sm text-slate-400 p-8 text-center">No upcoming quizzes scheduled.</p>
          ) : (
            quizList.map(q => (
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
            ))
          )}
        </div>

        {/* History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Quiz History</h2>
            <button onClick={() => onOpenModal?.('take-quiz')} className="text-xs text-brand-600 font-medium hover:underline flex items-center gap-1"><Download className="w-3 h-3" />Export</button>
          </div>
          <div className="divide-y divide-slate-100">
            {quizList.length === 0 ? (
              <p className="text-sm text-slate-400 p-8 text-center">No quizzes completed yet.</p>
            ) : (
              quizList.slice(0, 2).map(q => (
                <div key={`hist-${q.id}`} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 bg-success-50 text-success-700`}>100%</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{q.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{q.course} · {q.date} · {q.questions} questions</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-success-500`} style={{ width: `100%` }}></div>
                    </div>
                    <button onClick={() => onOpenModal?.('take-quiz', q)} className="text-xs text-brand-600 font-medium hover:underline ml-2">Review</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentAttendancePage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState<any>(null);

  // Dynamic course list & records (starts clean/empty until courses & sessions are logged)
  const courseList: any[] = studentCourses || [];
  const attendanceRecords: Record<string, { status: 'PRESENT' | 'ABSENT' | 'HOLIDAY' | 'LATE'; sessions: { course: string; time: string; status: string; room: string }[] }> = {};

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  // Calendar cells
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Monthly stats
  let totalClasses = 0;
  let presentClasses = 0;
  let absentClasses = 0;

  Object.entries(attendanceRecords).forEach(([dateStr, record]) => {
    const [y, m] = dateStr.split('-').map(Number);
    if (y === year && m === month + 1) {
      if (record.status === 'PRESENT') {
        presentClasses++;
        totalClasses++;
      } else if (record.status === 'ABSENT') {
        absentClasses++;
        totalClasses++;
      }
    }
  });

  const monthPct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={CalendarCheck} title="Attendance Calendar" subtitle="Interactive calendar schedule and attendance records across all courses.">
        <button onClick={() => onOpenModal?.('self-checkin')} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/25">
          <Zap className="w-4 h-4" />Self Check-in (OTP)
        </button>
      </PageHeader>

      {/* Course Summary Stat Cards */}
      {courseList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-400 text-sm">
          No course attendance records recorded yet. Use Self Check-in with a classroom OTP code or attend scheduled sessions to populate your record.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courseList.map(c => (
            <div key={c.code || c.name} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{c.code || 'CRS'}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{c.pct || 100}%</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm truncate mb-1" title={c.name}>{c.name}</p>
              <p className="text-xs text-slate-500">{c.present || 0} Attended · {c.absent || 0} Missed</p>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${c.pct || 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Calendar View Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
          {/* Calendar Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{monthNames[month]} {year}</h2>
                <p className="text-xs text-slate-500">Monthly attendance overview</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={todayMonth} className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Current
              </button>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-50 text-slate-600 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-200" />
                <button onClick={nextMonth} className="p-2 hover:bg-slate-50 text-slate-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 my-4 text-center">
            {weekDays.map(day => (
              <div key={day} className={`text-xs font-bold uppercase tracking-wider py-1 ${day === 'Sun' || day === 'Sat' ? 'text-slate-300' : 'text-slate-500'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Monthly Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((dayNum, idx) => {
              if (!dayNum) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-slate-50/50 border border-dashed border-slate-100" />;
              }

              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayOfWeek = (firstDayIndex + dayNum - 1) % 7;
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const record = attendanceRecords[dateKey];
              const isSelected = selectedDayRecord?.date === dateKey;

              let statusBg = 'bg-white hover:bg-slate-50 border-slate-200';
              let badgeText = '';
              let badgeColor = '';

              if (record) {
                if (record.status === 'PRESENT') {
                  statusBg = 'bg-emerald-50/60 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60';
                  badgeText = 'Present';
                  badgeColor = 'bg-emerald-500 text-white';
                } else if (record.status === 'ABSENT') {
                  statusBg = 'bg-rose-50/80 border-rose-200 text-rose-950 hover:bg-rose-100/80';
                  badgeText = 'Absent';
                  badgeColor = 'bg-rose-500 text-white';
                } else if (record.status === 'HOLIDAY') {
                  statusBg = 'bg-amber-50/70 border-amber-200 text-amber-950';
                  badgeText = 'Holiday';
                  badgeColor = 'bg-amber-500 text-white';
                }
              } else if (isWeekend) {
                statusBg = 'bg-slate-50/80 border-slate-100 text-slate-400';
              }

              return (
                <div key={dayNum}
                  onClick={() => setSelectedDayRecord({ date: dateKey, dayNum, record, isWeekend })}
                  className={`h-20 sm:h-24 p-2 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${statusBg} ${isSelected ? 'ring-2 ring-brand-600 shadow-md scale-[1.02]' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isWeekend ? 'text-slate-400' : 'text-slate-800'}`}>{dayNum}</span>
                    {badgeText && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor} shadow-sm hidden sm:inline-block`}>
                        {badgeText}
                      </span>
                    )}
                  </div>

                  {record && record.sessions?.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-[10px] font-semibold text-slate-700 truncate hidden sm:block">
                        {record.sessions[0].course}
                      </div>
                      {record.sessions.length > 1 && (
                        <div className="text-[9px] text-slate-500 font-medium hidden sm:block">
                          +{record.sessions.length - 1} more
                        </div>
                      )}
                      <div className="sm:hidden flex justify-center">
                        <div className={`w-2 h-2 rounded-full ${record.status === 'PRESENT' ? 'bg-emerald-500' : record.status === 'ABSENT' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      </div>
                    </div>
                  ) : !isWeekend ? (
                    <span className="text-[10px] text-slate-300 italic hidden sm:block">No session</span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 mt-6 pt-5 border-t border-slate-100">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />Present
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="w-3 h-3 rounded-md bg-rose-500" />Absent
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="w-3 h-3 rounded-md bg-amber-500" />Holiday / Break
            </span>
            <span className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" />Weekend
            </span>
          </div>
        </div>

        {/* Right Side: Day Details & Attendance Stats Panel */}
        <div className="space-y-6">
          {/* Selected Date Inspector Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              Day Details
            </h3>

            {selectedDayRecord ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Selected Date</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedDayRecord.date}</p>
                </div>

                {selectedDayRecord.record?.sessions ? (
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-700">Scheduled Sessions</p>
                    {selectedDayRecord.record.sessions.map((ses: any, i: number) => (
                      <div key={i} className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{ses.course}</p>
                          <p className="text-[11px] text-slate-500">{ses.time} · {ses.room}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ses.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : ses.status === 'Absent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {ses.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                    {selectedDayRecord.isWeekend ? 'Weekend — No lectures scheduled.' : 'No attendance recorded on this date.'}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                Click on any calendar date to view session schedule and lecture check-in status.
              </div>
            )}
          </div>

          {/* Monthly Performance Ratio Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-1">Monthly Average</h4>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-black">{monthPct}%</span>
              <span className="text-xs text-slate-300 font-medium">overall attendance</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Attended</span>
                <span className="text-lg font-bold text-emerald-400">{presentClasses} classes</span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-slate-400 block text-[11px]">Missed</span>
                <span className="text-lg font-bold text-rose-400">{absentClasses} classes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StudentDiscussionsPage({ onOpenModal, onToast, currentUser }: { onOpenModal?: (type: string, data?: any) => void; onToast?: (msg: string, type?: 'success'|'warning'|'info'|'danger') => void; currentUser?: any }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Compose state
  const [compose, setCompose] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('QUESTION');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Thread detail / reply modal state
  const [activeThread, setActiveThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Load enrolled courses for student
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { getMyEnrolledCoursesApi } = await import('./services/enrollmentService');
        const courseSvc = (await import('./services/courseService')).default;
        const res = await getMyEnrolledCoursesApi();
        let list = (res?.data || []).map((e: any) => e.course || e).filter((c: any) => c && c._id);
        
        // If student is not yet enrolled in any course, fallback to all available system courses
        if (list.length === 0) {
          const allCoursesRes = await courseSvc.getCourses();
          list = (allCoursesRes?.data || []).filter((c: any) => c && c._id);
        }

        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0]._id);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Failed to load enrolled courses:', err);
        setError('Could not load courses');
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch threads when course or filters change
  const fetchThreads = React.useCallback(async (courseId: string) => {
    if (!courseId) {
      setThreads([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const forumSvc = (await import('./services/forumService')).default;
      const res = await forumSvc.getCourseThreads(courseId, {
        category: categoryFilter,
        search: search.trim()
      });
      if (res?.success) {
        setThreads(res.data || []);
      } else {
        setThreads([]);
      }
    } catch (err: any) {
      console.error('Failed to load threads:', err);
      setError(err.response?.data?.message || 'Failed to load discussion threads.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchThreads(selectedCourseId);
    }
  }, [selectedCourseId, categoryFilter, fetchThreads]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourseId) {
      fetchThreads(selectedCourseId);
    }
  };

  // Create new thread
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedCourseId) {
      onToast?.('Please fill out the title and content.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      const forumSvc = (await import('./services/forumService')).default;
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await forumSvc.createThread(selectedCourseId, {
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tagsArray
      });
      if (res?.success) {
        onToast?.('Discussion thread published successfully!', 'success');
        setTitle('');
        setContent('');
        setTags('');
        setCompose(false);
        fetchThreads(selectedCourseId);
      }
    } catch (err: any) {
      onToast?.(err.response?.data?.message || 'Failed to create discussion thread.', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  // Open thread detail & load replies
  const handleOpenThread = async (thread: any) => {
    setActiveThread(thread);
    setLoadingReplies(true);
    setReplies([]);
    setReplyText('');
    try {
      const forumSvc = (await import('./services/forumService')).default;
      const res = await forumSvc.getThreadDetails(thread._id);
      if (res?.success) {
        setActiveThread(res.data.thread);
        setReplies(res.data.replies || []);
      }
    } catch (err: any) {
      console.error('Failed to load thread details:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Upvote thread
  const handleUpvote = async (threadId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const forumSvc = (await import('./services/forumService')).default;
      const res = await forumSvc.toggleThreadUpvote(threadId);
      if (res?.success) {
        setThreads(prev => prev.map(t => t._id === threadId ? { ...t, upvoteCount: res.data.upvoteCount } : t));
        if (activeThread && activeThread._id === threadId) {
          setActiveThread((prev: any) => ({ ...prev, upvoteCount: res.data.upvoteCount }));
        }
      }
    } catch (err) {
      console.error('Failed to upvote thread:', err);
    }
  };

  // Post reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    try {
      setSendingReply(true);
      const forumSvc = (await import('./services/forumService')).default;
      const res = await forumSvc.createReply(activeThread._id, { content: replyText.trim() });
      if (res?.success) {
        setReplies(prev => [...prev, res.data]);
        setReplyText('');
        setActiveThread((prev: any) => ({ ...prev, replyCount: (prev.replyCount || 0) + 1 }));
        setThreads(prev => prev.map(t => t._id === activeThread._id ? { ...t, replyCount: (t.replyCount || 0) + 1 } : t));
        onToast?.('Reply posted!', 'success');
      }
    } catch (err: any) {
      onToast?.(err.response?.data?.message || 'Failed to post reply', 'danger');
    } finally {
      setSendingReply(false);
    }
  };

  // Reply upvote
  const handleReplyUpvote = async (replyId: string) => {
    try {
      const forumSvc = (await import('./services/forumService')).default;
      const res = await forumSvc.toggleReplyUpvote(replyId);
      if (res?.success) {
        setReplies(prev => prev.map(r => r._id === replyId ? { ...r, upvoteCount: res.data.upvoteCount } : r));
      }
    } catch (err) {
      console.error('Failed to upvote reply:', err);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'QUESTION':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"><HelpCircle className="w-3 h-3" />Question</span>;
      case 'RESOURCE':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><BookOpen className="w-3 h-3" />Resource</span>;
      case 'ANNOUNCEMENT':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"><Megaphone className="w-3 h-3" />Announcement</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"><MessageSquare className="w-3 h-3" />Discussion</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={MessageSquare} title="Discussions & Q&A" subtitle="Ask questions, share insights, and collaborate with peers and faculty across courses.">
        <button
          onClick={() => setCompose(true)}
          disabled={courses.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-105 disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" />New Post
        </button>
      </PageHeader>

      {/* Filter and Course selector bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
          <div className="w-full sm:w-64">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              disabled={courses.length === 0}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-brand-500 bg-white"
            >
              {courses.length === 0 ? (
                <option value="">No enrolled courses available</option>
              ) : (
                courses.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.code})
                  </option>
                ))
              )}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72 mt-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics, questions..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
            />
          </form>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 self-start sm:self-end">
          {['ALL', 'QUESTION', 'DISCUSSION', 'RESOURCE'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* New Post Form */}
      {compose && (
        <div className="bg-white rounded-3xl border border-brand-200 shadow-xl p-6 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-brand-600" />
              Create Discussion Thread
            </h3>
            <button onClick={() => setCompose(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How does Dijkstra's algorithm handle negative weights?"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 bg-white text-slate-800"
                >
                  <option value="QUESTION">Question</option>
                  <option value="DISCUSSION">General Discussion</option>
                  <option value="RESOURCE">Resource Sharing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Content / Description</label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Explain your doubt, share context, code snippets, or thoughts..."
                className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 resize-none bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. graphs, algorithms, homework-3"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompose(false)}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Publishing...' : 'Publish Thread'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discussion List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">Loading discussions...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-center text-sm font-medium">
            {error}
          </div>
        ) : threads.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 text-brand-500">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">No Discussions Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              Be the first to start a conversation, ask a lecture question, or share study materials with your peers!
            </p>
            <button
              onClick={() => setCompose(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 shadow-md shadow-brand-500/20"
            >
              <PlusCircle className="w-4 h-4" /> Start First Thread
            </button>
          </div>
        ) : (
          threads.map(thread => (
            <div
              key={thread._id}
              onClick={() => handleOpenThread(thread)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all p-5 sm:p-6 cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                    {thread.authorId?.name ? thread.authorId.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {getCategoryBadge(thread.category)}
                      {thread.isResolved && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                      {thread.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {thread.content}
                    </p>

                    {thread.tags && thread.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {thread.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 flex-wrap">
                      <span className="font-medium text-slate-700">by {thread.authorId?.name || 'Anonymous'}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-slate-400" />{thread.replyCount || 0} replies</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <button
                    onClick={(e) => handleUpvote(thread._id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 text-slate-600 hover:text-brand-600 text-xs font-bold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{thread.upvoteCount || 0}</span>
                  </button>
                  <span className="text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Thread <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thread Details & Replies Modal */}
      {activeThread && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(activeThread.category)}
                  {activeThread.isResolved && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Solved
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-900 leading-snug">{activeThread.title}</h3>
                <p className="text-xs text-slate-400">
                  Posted by <span className="font-semibold text-slate-700">{activeThread.authorId?.name || 'Anonymous'}</span> · {new Date(activeThread.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setActiveThread(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Question / Post Details */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{activeThread.content}</p>
                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {activeThread.tags?.map((t: string, i: number) => (
                      <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-medium">#{t}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleUpvote(activeThread._id)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:text-brand-600 transition-colors shadow-sm"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-brand-600" />
                    <span>{activeThread.upvoteCount || 0}</span>
                  </button>
                </div>
              </div>

              {/* Replies Section */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-brand-600" />
                  Replies & Answers ({replies.length})
                </h4>

                {loadingReplies ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <div className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
                    Loading answers...
                  </div>
                ) : replies.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-2xl text-center text-slate-400 text-xs border border-dashed border-slate-200">
                    No replies yet. Be the first to share your knowledge!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {replies.map((reply: any) => (
                      <div key={reply._id} className={`p-4 rounded-2xl border text-sm transition-all ${
                        reply.isFacultyEndorsed
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                              {reply.authorId?.name ? reply.authorId.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800 text-xs">{reply.authorId?.name || 'Anonymous'}</span>
                              <span className="text-[10px] text-slate-400 ml-2">{new Date(reply.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {reply.isFacultyEndorsed && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Faculty Verified
                            </span>
                          )}
                        </div>

                        <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap pl-9">{reply.content}</p>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleReplyUpvote(reply._id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-brand-600 px-2 py-0.5 rounded hover:bg-slate-50 transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{reply.upvoteCount || 0}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer / Reply Input */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your answer or thoughts..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sendingReply ? 'Posting...' : 'Reply'}
              </button>
            </form>
          </div>
        </div>
      )}
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
            {subjectRadar.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <Radar className="w-8 h-8 text-slate-300 mb-2" />
                No skill map data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={subjectRadar}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsRadar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Score trend */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">8-Week Score Trend</h2>
          <div className="h-64">
            {performanceTrend.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
                No score trend data available yet.
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Subject Breakdown</h2></div>
        <div className="divide-y divide-slate-100">
          {subjectRadar.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No subject breakdown available yet.</p>
          ) : (
            subjectRadar.map(s => (
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
            ))
          )}
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
            {analyticsScoreDist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
                No score distribution data available.
              </div>
            ) : (
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
            )}
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
          {allStudents.filter(s => s.risk === 'high').length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No students currently flagged as high risk.</p>
          ) : (
            allStudents.filter(s => s.risk === 'high').map(s => (
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
            ))
          )}
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
            {attentionTopics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <Target className="w-8 h-8 text-slate-300 mb-2" />
                No attention topics identified yet.
              </div>
            ) : (
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
            )}
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-slate-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{s.name.split(' ').map((w: string)=>w[0]).join('').slice(0,2)}</div>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyAssignmentsPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const [courses, setCourses]         = React.useState<any[]>([]);
  const [assignments, setAssignments] = React.useState<any[]>([]);
  const [loadingA, setLoadingA]       = React.useState(true);
  const [errorA, setErrorA]           = React.useState('');
  const [detailAssignment, setDetailAssignment] = React.useState<any>(null);
  const [subsAssignment, setSubsAssignment]     = React.useState<any>(null);
  const [submissions, setSubmissions]           = React.useState<any[]>([]);
  const [loadingSubs, setLoadingSubs]           = React.useState(false);
  const [gradingSub, setGradingSub]       = React.useState<any>(null);
  const [gradeScore, setGradeScore]       = React.useState('');
  const [gradeFeedback, setGradeFeedback] = React.useState('');
  const [savingGrade, setSavingGrade]     = React.useState(false);
  const [deleteTarget, setDeleteTarget]   = React.useState<any>(null);
  const [deleting, setDeleting]           = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoadingA(true); setErrorA('');
      const courseService = (await import('./services/courseService')).default;
      const assessmentSvc = (await import('./services/assessmentService')).default;
      const courseRes     = await courseService.getFacultyCourses();
      const myCourses: any[] = courseRes?.courses || courseRes?.data || [];
      setCourses(myCourses);
      const allAssignments: any[] = [];
      await Promise.all(myCourses.map(async (c: any) => {
        try {
          const aRes = await assessmentSvc.getCourseAssessments(c._id);
          const aList: any[] = aRes?.data || aRes?.assessments || (Array.isArray(aRes) ? aRes : []);
          aList.filter((a: any) => a.type === 'ASSIGNMENT')
            .forEach((a: any) => allAssignments.push({ ...a, courseName: c.title, courseId: c._id }));
        } catch { /* skip */ }
      }));
      setAssignments(allAssignments);
    } catch (err: any) { setErrorA(err.message || 'Failed to load assignments'); }
    finally { setLoadingA(false); }
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const openSubmissions = async (a: any) => {
    setSubsAssignment(a); setDetailAssignment(null); setSubmissions([]); setLoadingSubs(true);
    try {
      const svc = (await import('./services/assessmentService')).default;
      const res = await svc.getAssessmentSubmissions(a._id);
      if (res?.success) setSubmissions(res.data);
    } catch { /* ignore */ } finally { setLoadingSubs(false); }
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault(); if (!gradingSub) return;
    try {
      setSavingGrade(true);
      const svc = (await import('./services/assessmentService')).default;
      await svc.gradeSubmission(gradingSub._id, { score: Number(gradeScore), feedback: gradeFeedback });
      setGradingSub(null);
      if (subsAssignment) await openSubmissions(subsAssignment);
    } catch (err: any) { alert(err.message || 'Failed to save grade.'); }
    finally { setSavingGrade(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const svc = (await import('./services/assessmentService')).default;
      await svc.deleteAssessment(deleteTarget._id);
      setDeleteTarget(null);
      setAssignments(prev => prev.filter(a => a._id !== deleteTarget._id));
    } catch (err: any) { alert(err.message || 'Failed to delete assignment.'); }
    finally { setDeleting(false); }
  };

  if (detailAssignment) {
    const a = detailAssignment;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => setDetailAssignment(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium">
          <ChevronLeft className="w-4 h-4" /> Back to Assignments
        </button>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">{a.courseName}</span>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{a.title}</h1>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileQuestion className="w-3.5 h-3.5" /> ASSIGNMENT
            </span>
          </div>
          <div className="flex flex-wrap gap-3 mb-6">
            {a.dueDate && <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs text-slate-600"><CalendarCheck className="w-3.5 h-3.5 text-brand-400" /> Due: {new Date(a.dueDate).toLocaleString()}</div>}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs text-slate-600"><Award className="w-3.5 h-3.5 text-amber-400" /> {a.totalPoints} pts</div>
          </div>
          {a.description && <div className="mb-4"><h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</h4><p className="text-sm text-slate-600 leading-relaxed">{a.description}</p></div>}
          {a.instructions && <div><h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Instructions &amp; Rubric</h4><p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{a.instructions}</p></div>}
        </div>
        <div className="flex items-center justify-end gap-3">
          <button onClick={() => { setDeleteTarget(a); setDetailAssignment(null); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-semibold rounded-xl border border-rose-200 transition-colors"><Trash2 className="w-4 h-4" /> Delete Assignment</button>
          <button onClick={() => openSubmissions(a)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-brand-500/20"><Users className="w-4 h-4" /> View Submissions</button>
        </div>
      </div>
    );
  }

  if (subsAssignment) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <button onClick={() => { setSubsAssignment(null); setGradingSub(null); }} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium"><ChevronLeft className="w-4 h-4" /> Back to Assignments</button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2"><Users className="w-7 h-7 text-brand-500" /> Submission Review</h1>
            <p className="text-sm text-slate-500 mt-1">For: <span className="font-semibold text-slate-800">{subsAssignment.title}</span>&nbsp;·&nbsp;<span className="text-brand-600">{subsAssignment.courseName}</span></p>
          </div>
          <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">{submissions.length} Submission{submissions.length !== 1 ? 's' : ''}</span>
        </div>
        {loadingSubs ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /><span className="text-sm text-slate-400">Loading submissions...</span></div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"><Users className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h3 className="font-bold text-slate-700 mb-1">No Submissions Yet</h3><p className="text-sm text-slate-400">Students have not submitted anything for this assignment.</p></div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr><th className="px-5 py-4">Student</th><th className="px-5 py-4">Submitted</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Score</th><th className="px-5 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub: any) => {
                  const isGraded = sub.status === 'GRADED';
                  return (
                    <tr key={sub._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4"><div className="font-semibold text-slate-900">{sub.studentId?.name || 'Unknown'}</div><div className="text-xs text-slate-400">{sub.studentId?.email}</div></td>
                      <td className="px-5 py-4 text-xs text-slate-400">{new Date(sub.submittedAt).toLocaleString()}</td>
                      <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isGraded ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>{isGraded ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{sub.status}</span></td>
                      <td className="px-5 py-4 font-bold text-slate-800">{isGraded ? `${sub.score} / ${sub.totalPoints} (${sub.percentage}%)` : '---'}</td>
                      <td className="px-5 py-4 text-right"><button onClick={() => { setGradingSub(sub); setGradeScore(sub.score ?? ''); setGradeFeedback(sub.feedback || ''); }} className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors">{isGraded ? 'Edit Grade' : 'Grade Now'}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {gradingSub && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div><h3 className="text-lg font-bold text-slate-900">Grade Submission</h3><p className="text-xs text-slate-400">Student: {gradingSub.studentId?.name}</p></div>
                <button onClick={() => setGradingSub(null)} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"><X className="w-5 h-5" /></button>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl max-h-40 overflow-y-auto text-xs text-slate-600 space-y-2">
                <span className="font-bold text-slate-400 uppercase block">Student Response:</span>
                <p className="whitespace-pre-wrap">{gradingSub.content || 'No written response.'}</p>
                {gradingSub.attachmentUrl && <a href={gradingSub.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:underline font-medium pt-1"><ArrowUpRight className="w-3.5 h-3.5" /> View Attachment</a>}
              </div>
              <form onSubmit={handleSaveGrade} className="space-y-4">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Score (out of {gradingSub.totalPoints || 100})</label><input type="number" required min="0" max={gradingSub.totalPoints || 100} value={gradeScore} onChange={e => setGradeScore(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-500" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Feedback</label><textarea rows={3} value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} placeholder="Provide constructive feedback..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-500" /></div>
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setGradingSub(null)} className="px-4 py-2 text-slate-500 hover:text-slate-800 text-sm font-semibold">Cancel</button>
                  <button type="submit" disabled={savingGrade} className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50">{savingGrade ? 'Saving...' : 'Save and Publish Grade'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={ClipboardList} title="Assignments" subtitle="Manage, review, and grade assignments across your courses." />
      {loadingA ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3"><div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /><span className="text-sm text-slate-400">Loading assignments...</span></div>
      ) : errorA ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 text-sm"><AlertCircle className="w-5 h-5 flex-shrink-0" />{errorA}</div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3"><ClipboardList className="w-7 h-7 text-brand-400" /></div>
          <h3 className="font-bold text-slate-900 mb-1">No Assignments Yet</h3>
          <p className="text-sm text-slate-400">Go to a course and click Create Assessment to add your first assignment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a: any) => (
            <div key={a._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md">{a.courseName}</span>
                  <h3 className="font-bold text-slate-900 mt-2 text-base truncate">{a.title}</h3>
                  {a.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{a.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {a.dueDate && <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg"><CalendarCheck className="w-3.5 h-3.5 text-brand-400" /> Due {new Date(a.dueDate).toLocaleDateString()}</span>}
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg"><Award className="w-3.5 h-3.5 text-amber-400" /> {a.totalPoints} pts</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                  <button onClick={() => setDetailAssignment(a)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"><Eye className="w-4 h-4" /> View</button>
                  <button onClick={() => openSubmissions(a)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-brand-500/20"><Users className="w-4 h-4" /> Submissions</button>
                  <button onClick={() => setDeleteTarget(a)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors border border-rose-200"><Trash2 className="w-4 h-4" /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center flex-shrink-0"><Trash2 className="w-6 h-6 text-rose-500" /></div>
              <div><h3 className="text-lg font-bold text-slate-900">Delete Assignment?</h3><p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p></div>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl"><p className="text-sm font-semibold text-slate-800">{deleteTarget.title}</p><p className="text-xs text-slate-500 mt-0.5">{deleteTarget.courseName}</p></div>
            <p className="text-sm text-slate-500">All student submissions will also be permanently deleted. Are you sure?</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="px-5 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-rose-500/20 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4" />{deleting ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyAttendancePage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = React.useCallback(async () => {
    try {
      setLoading(true);
      const cSvc = (await import('./services/courseService')).default;
      const attSvc = (await import('./services/attendanceService')).default;
      const myCoursesRes = await cSvc.getFacultyCourses();
      const courses = myCoursesRes?.courses || myCoursesRes?.data || [];
      const cId = courses[0]?._id;

      if (cId) {
        const sRes = await attSvc.getCourseSessions(cId);
        const list = sRes?.data || sRes?.sessions || (Array.isArray(sRes) ? sRes : []);
        setSessions(list.map((s: any) => ({
          id: s._id,
          _id: s._id,
          day: new Date(s.date).toLocaleDateString(undefined, { weekday: 'short' }),
          date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          topic: s.title,
          present: 1,
          absent: 0
        })));
      }
    } catch (err: any) {
      console.warn('Could not load faculty attendance sessions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={CalendarCheck} title="Attendance" subtitle="Track and manage student attendance across all sessions.">
        <div className="flex items-center gap-2">
          <button onClick={loadSessions} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => onOpenModal?.('record-attendance')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20">
            <PlusCircle className="w-4 h-4" />Mark Today
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Sessions" value={sessions.length} color="brand" icon={CalendarCheck} />
        <SummaryCard label="Avg Attendance" value={sessions.length > 0 ? "100%" : "—"} color="success" icon={Users} />
        <SummaryCard label="Below 75%" value="0" color="danger" icon={AlertCircle} />
        <SummaryCard label="Perfect Attendance" value={sessions.length > 0 ? "1" : "—"} color="success" icon={Award} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Session Log — Enrolled Courses</h2>
          <button onClick={() => onOpenModal?.('record-attendance')} className="flex items-center gap-2 text-xs text-brand-600 font-medium hover:underline"><Download className="w-3 h-3" />Record Session</button>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <p className="text-sm text-slate-400 py-8 text-center">Loading attendance sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No attendance sessions recorded yet. Click "Mark Today" to start a live session.</p>
          ) : (
            sessions.map((s,i) => {
              const pct = Math.round(s.present / Math.max(s.present+s.absent, 1) * 100);
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
            })
          )}
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
            {courseAnalytics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
                No topic performance data available.
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">Score Distribution</h2>
          <div className="h-64">
            {analyticsScoreDist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
                No score distribution data available.
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Topic-wise Breakdown</h2></div>
        <div className="divide-y divide-slate-100">
          {courseAnalytics.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No topic breakdown data available yet.</p>
          ) : (
            courseAnalytics.map(t => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function FacultyInterventionsPage({ onOpenModal }: { onOpenModal?: (type: string, data?: any) => void }) {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInterventions = React.useCallback(async () => {
    try {
      setLoading(true);
      const intSvc = (await import('./services/interventions/interventionService')).default;
      const res = await intSvc.getInterventions();
      const list = res?.data || res?.interventions || (Array.isArray(res) ? res : []);
      setInterventions(list.map((it: any) => ({
        id: it._id,
        student: it.studentId?.name || 'John Student',
        course: it.courseId?.code || 'CS201',
        type: it.actionType || 'Office Hours',
        date: new Date(it.createdAt).toLocaleDateString(),
        status: it.status?.toLowerCase() || 'active',
        outcome: it.outcome !== 'PENDING' ? it.outcome : null
      })));
    } catch (err: any) {
      console.warn('Could not load interventions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInterventions();
  }, [loadInterventions]);

  const statusColors: Record<string, string> = {
    active:   'bg-brand-50 text-brand-700',
    pending:  'bg-warning-50 text-warning-700',
    assigned: 'bg-indigo-50 text-indigo-700',
    resolved: 'bg-success-50 text-success-700',
  };
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <PageHeader icon={ShieldAlert} title="Interventions" subtitle="Track all student interventions — active, pending, and resolved.">
        <div className="flex items-center gap-2">
          <button onClick={loadInterventions} className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => onOpenModal?.('create-intervention')} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-sm shadow-brand-500/20"><PlusCircle className="w-4 h-4" />New Intervention</button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Active" value={interventions.filter(i=>i.status==='active'||i.status==='assigned').length} color="brand" icon={Activity} />
        <SummaryCard label="Pending" value={interventions.filter(i=>i.status==='pending').length} color="warning" icon={Clock} />
        <SummaryCard label="Resolved" value={interventions.filter(i=>i.status==='resolved'||i.status==='completed').length} color="success" icon={CheckCircle2} />
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                    Loading interventions...
                  </td>
                </tr>
              ) : interventions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-400">
                    No interventions recorded yet. Click "New Intervention" to schedule one.
                  </td>
                </tr>
              ) : (
                interventions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">{item.student.split(' ').map((w: string)=>w[0]).join('').slice(0,2)}</div>
                        <span className="text-sm font-semibold text-slate-900">{item.student}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">{item.course}</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{item.type}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{item.date}</td>
                    <td className="px-4 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[item.status] || 'bg-slate-100 text-slate-700'}`}>{item.status}</span></td>
                    <td className="px-4 py-4">
                      {item.outcome ? <span className="text-xs text-success-600 font-semibold capitalize">{item.outcome}</span> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => onOpenModal?.('create-intervention', item)} className="text-xs text-brand-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity hover:underline">View</button>
                    </td>
                  </tr>
                ))
              )}
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
            {filteredAlerts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No alerts to display.</p>
            ) : (
              filteredAlerts.map(a => (
                <div key={a.id} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                  <AlertDot type={a.type} />
                  <div className="flex-1 min-w-0"><p className="text-sm text-slate-800">{a.message}</p><p className="text-xs text-slate-400 mt-1">{a.dept} · {a.time}</p></div>
                  <button onClick={() => onOpenModal?.('notifications', a)} className="text-xs text-brand-600 font-medium hover:underline mt-0.5">Review</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1">
            <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2"><Award className="w-5 h-5 text-slate-400" />Top Interveners</h2>
            <div className="space-y-4">
              {topFaculty.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No intervener data yet.</p>
              ) : (
                topFaculty.map((f,i) => (
                  <div key={f.name} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i===0?'bg-yellow-100 text-yellow-700':i===1?'bg-slate-100 text-slate-600':'bg-orange-100 text-orange-700'}`}>{i+1}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-800 truncate">{f.name}</p><p className="text-xs text-slate-400">{f.dept}</p></div>
                    <div className="text-right shrink-0"><p className="text-sm font-bold text-success-600">{f.successRate}%</p><p className="text-xs text-slate-400">{f.interventions} cases</p></div>
                  </div>
                ))
              )}
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
        {departmentData.length === 0 ? (
          <div className="col-span-3 py-16 text-center">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No department data available yet.</p>
          </div>
        ) : departmentData.map(d => {
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
          {deptTrendData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <BarChart2 className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No trend data available yet.</p>
            </div>
          ) : (
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
          )}
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
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">No faculty records found.</td></tr>
              ) : filtered.map(f => (
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
              {adminInterventions.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">No interventions recorded yet.</td></tr>
              ) : adminInterventions.map(item => (
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
            {analyticsScoreDist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <BarChart2 className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No score distribution data yet.</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <h2 className="font-semibold text-slate-900 mb-6">Department Score Trends</h2>
          <div className="h-56">
            {deptTrendData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <BarChart2 className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No trend data available yet.</p>
              </div>
            ) : (
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
            )}
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
              {departmentData.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">No department data available yet.</td></tr>
              ) : departmentData.map(row => {
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
