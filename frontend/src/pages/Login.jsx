import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Branding Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-xl shadow-indigo-500/20 mb-4 inline-flex">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            EduPulse
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-medium">
            Learn. Analyze. Improve.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <h2 className="text-xl font-bold text-slate-100 mb-6 text-center">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 text-sm transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick Demo Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ email: 'student@example.com', password: 'Password123!' })}
                className="py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-semibold transition-colors"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: 'faculty@example.com', password: 'Password123!' })}
                className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-xs font-semibold transition-colors"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => setFormData({ email: 'admin@example.com', password: 'Password123!' })}
                className="py-1.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-lg text-xs font-semibold transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-sm">
            <span className="text-slate-400">Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline transition-colors"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
