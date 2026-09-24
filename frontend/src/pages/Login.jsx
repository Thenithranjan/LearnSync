import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  GraduationCap, Mail, Lock, Eye, EyeOff,
  ArrowRight, AlertCircle, BookOpen, Users, Shield, Sparkles, Zap
} from 'lucide-react';

// ─── Demo credentials per role ────────────────────────────────────────────────
const DEMO_ROLES = [
  {
    id: 'student',
    label: 'Student',
    email: 'student@example.com',
    password: 'Password123!',
    icon: BookOpen,
    gradient: 'from-violet-500 to-indigo-500',
    glow: 'shadow-violet-500/30',
    border: 'border-violet-500/30 hover:border-violet-400/60',
    bg: 'bg-violet-500/10 hover:bg-violet-500/20',
    tag: 'text-violet-300',
    badge: 'bg-violet-500/20 text-violet-200',
    desc: 'Browse courses & track progress',
  },
  {
    id: 'faculty',
    label: 'Teacher',
    email: 'faculty@example.com',
    password: 'Password123!',
    icon: Users,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/30',
    border: 'border-amber-500/30 hover:border-amber-400/60',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    tag: 'text-amber-300',
    badge: 'bg-amber-500/20 text-amber-200',
    desc: 'Manage classes & analytics',
  },
  {
    id: 'admin',
    label: 'Admin',
    email: 'admin@example.com',
    password: 'Password123!',
    icon: Shield,
    gradient: 'from-rose-500 to-pink-500',
    glow: 'shadow-rose-500/30',
    border: 'border-rose-500/30 hover:border-rose-400/60',
    bg: 'bg-rose-500/10 hover:bg-rose-500/20',
    tag: 'text-rose-300',
    badge: 'bg-rose-500/20 text-rose-200',
    desc: 'Full system control',
  },
];

// ─── Animated floating particle ──────────────────────────────────────────────
const Particle = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none opacity-20"
    style={style}
  />
);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState(null);
  const [fillAnimating, setFillAnimating] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 80 + 20,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      color: ['#6366f1', '#8b5cf6', '#f59e0b', '#f43f5e'][i % 4],
      duration: `${Math.random() * 8 + 6}s`,
      delay: `${Math.random() * 4}s`,
    }))
  );

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    setActiveRole(null);
  };

  // Fill credentials AND auto-submit
  const handleDemoLogin = async (role) => {
    if (loading) return;
    setActiveRole(role.id);
    setFillAnimating(true);
    setError('');

    // Animate the fill with a slight delay for visual effect
    await new Promise((r) => setTimeout(r, 150));
    setFormData({ email: role.email, password: role.password });
    setFillAnimating(false);

    // Auto-submit after brief moment so user sees the filled values
    await new Promise((r) => setTimeout(r, 600));
    setLoading(true);
    try {
      await login(role.email, role.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setActiveRole(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-10 px-4 relative overflow-hidden">

      {/* ── Animated background blobs ── */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          top: '-10%', left: '50%', transform: 'translateX(-50%)',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          bottom: '0', right: '-10%',
          animation: 'pulse 10s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 70%)',
          bottom: '20%', left: '-5%',
          animation: 'pulse 12s ease-in-out infinite',
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            background: p.color,
            opacity: 0.04,
            filter: 'blur(20px)',
            animation: `float ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">

        {/* ── Logo & Branding ── */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative mb-4"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.15)',
              }}
            >
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            {/* Sparkle badge */}
            <div
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #f43f5e)' }}
            >
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1
            className="text-4xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #fff 30%, #a5b4fc 70%, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EduPlus
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-400 tracking-wide">
            Intelligent Learning & Analytics Platform
          </p>
        </div>

        {/* ── Main Card ── */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
          }}
        >
          {/* ── Role Quick-Login Cards ── */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Quick Login — One Click
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {DEMO_ROLES.map((role) => {
                const Icon = role.icon;
                const isActive = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    id={`demo-login-${role.id}`}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin(role)}
                    className="group relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${role.gradient.replace('from-', '').split(' ')[0]}, ${role.gradient.split(' ')[1]}) 0.1`
                        : 'rgba(255,255,255,0.03)',
                      borderColor: isActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)',
                      boxShadow: isActive ? `0 8px 24px ${role.glow.replace('shadow-', '').replace('/30', '')}33` : 'none',
                      transform: isActive ? 'scale(1.04)' : 'scale(1)',
                    }}
                  >
                    {/* Icon circle */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${
                          role.id === 'student' ? '#6366f1, #8b5cf6' :
                          role.id === 'faculty' ? '#f59e0b, #f97316' :
                          '#f43f5e, #ec4899'
                        })`,
                        boxShadow: isActive ? `0 4px 14px ${
                          role.id === 'student' ? 'rgba(99,102,241,0.5)' :
                          role.id === 'faculty' ? 'rgba(245,158,11,0.5)' :
                          'rgba(244,63,94,0.5)'
                        }` : 'none',
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-200 text-center leading-tight">
                      {role.label}
                    </span>
                    {isActive && loading && (
                      <div
                        className="absolute bottom-2 flex gap-0.5"
                      >
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1 h-1 rounded-full bg-white"
                            style={{
                              animation: `bounce 0.8s ease-in-out infinite`,
                              animationDelay: `${i * 0.15}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-2.5">
              Click any role above to auto-fill & sign in instantly
            </p>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.2))' }} />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-1">or sign in manually</span>
            <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(99,102,241,0.2))' }} />
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div
              className="mb-5 p-3.5 rounded-xl flex items-start gap-3 text-sm"
              style={{
                background: 'rgba(244,63,94,0.08)',
                border: '1px solid rgba(244,63,94,0.2)',
                color: '#fda4af',
              }}
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Login Form ── */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="block w-full pl-11 pr-4 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 focus:outline-none"
                  style={{
                    background: fillAnimating
                      ? 'rgba(99,102,241,0.05)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${formData.email ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: formData.email ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="login-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-11 py-3 rounded-xl text-sm text-slate-100 placeholder-slate-600 transition-all duration-200 focus:outline-none"
                  style={{
                    background: fillAnimating
                      ? 'rgba(99,102,241,0.05)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${formData.password ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: formData.password ? '0 0 0 3px rgba(99,102,241,0.08)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, #4338ca, #6d28d9)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Footer ── */}
          <div className="mt-6 pt-5 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-slate-500">Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline transition-colors"
            >
              Register here
            </Link>
          </div>
        </div>

        {/* ── Bottom badge ── */}
        <p className="text-center text-[11px] text-slate-600 mt-5">
          🔒 Secure encrypted connection · EduPlus v2.0
        </p>
      </div>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.05); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        #login-email:focus, #login-password:focus {
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
          background: rgba(99,102,241,0.06) !important;
        }

        button[id^="demo-login-"]:hover:not(:disabled) {
          transform: scale(1.05) translateY(-2px) !important;
          border-color: rgba(255,255,255,0.15) !important;
          background: rgba(255,255,255,0.06) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
