import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import attendanceService from '../../services/attendanceService';
import courseService from '../../services/courseService';
import { getMyEnrolledCoursesApi } from '../../services/enrollmentService';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  KeyRound,
  ShieldAlert,
  Percent,
  Calendar
} from 'lucide-react';

const StudentAttendancePage = () => {
  const { courseId: paramCourseId } = useParams();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(paramCourseId || '');
  const [course, setCourse] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // OTP Check-in state
  const [otpCode, setOtpCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState('');

  // 1. Fetch available enrolled courses if no courseId param is in URL
  useEffect(() => {
    const initEnrolledCourses = async () => {
      if (!paramCourseId) {
        try {
          const res = await getMyEnrolledCoursesApi();
          const list = res.data || [];
          setEnrolledCourses(list);
          if (list.length > 0) {
            const firstId = list[0].course?._id || list[0]._id;
            setSelectedCourseId(firstId);
          } else {
            setLoading(false);
          }
        } catch (err) {
          setError('Failed to load enrolled courses.');
          setLoading(false);
        }
      } else {
        setSelectedCourseId(paramCourseId);
      }
    };
    initEnrolledCourses();
  }, [paramCourseId]);

  // 2. Fetch attendance data whenever selectedCourseId changes
  const fetchAttendanceData = async (targetId) => {
    if (!targetId) return;
    try {
      setLoading(true);
      setError('');
      const [courseRes, summaryRes] = await Promise.all([
        courseService.getCourseById(targetId),
        attendanceService.getMyAttendanceSummary(targetId)
      ]);

      if (courseRes?.success) setCourse(courseRes.data);
      if (summaryRes?.success) setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchAttendanceData(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleOtpCheckIn = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || !selectedCourseId) return;

    try {
      setCheckingIn(true);
      setError('');
      setCheckInSuccess('');
      const res = await attendanceService.selfCheckIn(selectedCourseId, otpCode);
      if (res?.success) {
        setCheckInSuccess('You have successfully checked in for today’s session!');
        setOtpCode('');
        fetchAttendanceData(selectedCourseId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired check-in code.');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading && !course) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-400 text-sm">Loading attendance records...</span>
        </div>
      </MainLayout>
    );
  }

  const isAtRisk = summary?.isAtRisk;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Navigation & Course Switcher */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link to={selectedCourseId ? `/learning/${selectedCourseId}` : '/my-courses'} className="hover:text-slate-200 text-slate-400 text-sm transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Courses
          </Link>

          {!paramCourseId && enrolledCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Select Course:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {enrolledCourses.map((e) => {
                  const cObj = e.course || e;
                  return (
                    <option key={cObj._id} value={cObj._id}>
                      {cObj.title} ({cObj.code})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-indigo-400" />
            Attendance & Participation
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Course record for: <span className="text-slate-200 font-medium">{course?.title || 'Selected Course'}</span>
          </p>
        </div>

        {/* Low Attendance Warning Alert (<75%) */}
        {isAtRisk && (
          <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-start gap-4 text-rose-300 shadow-xl">
            <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-white">Attendance Warning: Below 75% Threshold</h3>
              <p className="text-xs sm:text-sm text-rose-200 mt-1 leading-relaxed">
                Your current attendance is {summary?.percentage}%. University regulations require a minimum of 75% attendance to qualify for final course grading and examinations.
              </p>
            </div>
          </div>
        )}

        {/* Quick OTP Code Check-In Card */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                Live Session Check-In
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Enter the 6-digit code shared by your instructor in class today to record your attendance.
              </p>
            </div>

            <form onSubmit={handleOtpCheckIn} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code"
                className="w-36 px-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-center text-white tracking-widest font-mono text-base font-bold focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={checkingIn || otpCode.length < 6 || !selectedCourseId}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap"
              >
                {checkingIn ? 'Verifying...' : 'Check In'}
              </button>
            </form>
          </div>

          {checkInSuccess && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{checkInSuccess}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sessions</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{summary?.totalSessions || 0}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Present</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">{summary?.presentCount || 0}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Absent</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">{summary?.absentCount || 0}</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Attendance Rate</span>
            <p className={`text-2xl sm:text-3xl font-extrabold mt-1 ${isAtRisk ? 'text-rose-400' : 'text-indigo-400'}`}>
              {summary?.percentage || 0}%
            </p>
          </div>
        </div>

        {/* Attendance Records History */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-6">Session Breakdown</h2>

          {summary?.records?.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No class sessions recorded yet for this course.
            </div>
          ) : (
            <div className="space-y-3">
              {summary?.records?.map((record) => {
                const isPresent = record.status === 'PRESENT' || record.status === 'LATE';
                return (
                  <div
                    key={record._id}
                    className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPresent
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isPresent ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {record.sessionId?.title || 'Class Session'}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(record.sessionId?.date || record.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="uppercase text-[10px] font-bold text-indigo-400">
                            {record.sessionId?.sessionType || 'LECTURE'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          isPresent
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {record.status}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        Via {record.markedBy === 'SELF_OTP' ? 'OTP Check-in' : 'Instructor'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentAttendancePage;
