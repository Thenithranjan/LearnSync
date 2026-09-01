import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import attendanceService from '../../services/attendanceService';
import courseService from '../../services/courseService';
import {
  CalendarCheck,
  Plus,
  KeyRound,
  CheckCircle2,
  Users,
  ChevronLeft,
  Calendar,
  Save,
  AlertCircle,
  Copy,
  Check,
  X
} from 'lucide-react';

const FacultyAttendancePage = () => {
  const { courseId: paramCourseId } = useParams();
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(paramCourseId || '');
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [rosterData, setRosterData] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [savingRoster, setSavingRoster] = useState(false);

  // New Session Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newType, setNewType] = useState('LECTURE');
  const [enableOtp, setEnableOtp] = useState(true);
  const [otpValidity, setOtpValidity] = useState(15);
  const [creating, setCreating] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // 1. Fetch available faculty courses if courseId param is missing
  useEffect(() => {
    const initFacultyCourses = async () => {
      if (!paramCourseId) {
        try {
          const res = await courseService.getFacultyCourses();
          const list = res.data || [];
          setFacultyCourses(list);
          if (list.length > 0) {
            setSelectedCourseId(list[0]._id);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error('Failed to fetch faculty courses:', err);
          setLoading(false);
        }
      } else {
        setSelectedCourseId(paramCourseId);
      }
    };
    initFacultyCourses();
  }, [paramCourseId]);

  // 2. Fetch course sessions and report when selectedCourseId is set
  const fetchInitialData = async (targetCourseId) => {
    if (!targetCourseId) return;
    try {
      setLoading(true);
      const [courseRes, sessionsRes, reportRes] = await Promise.all([
        courseService.getCourseById(targetCourseId),
        attendanceService.getCourseSessions(targetCourseId),
        attendanceService.getCourseAttendanceReport(targetCourseId).catch(() => null)
      ]);

      if (courseRes?.success) setCourse(courseRes.data);
      if (sessionsRes?.success) {
        setSessions(sessionsRes.data);
        if (sessionsRes.data.length > 0) {
          setSelectedSessionId(sessionsRes.data[0]._id);
        } else {
          setSelectedSessionId(null);
          setRosterData(null);
        }
      }
      if (reportRes?.success) setReport(reportRes.data);
    } catch (err) {
      console.error('Error loading faculty attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchInitialData(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchRoster(selectedSessionId);
    }
  }, [selectedSessionId]);

  const fetchRoster = async (sessionId) => {
    try {
      setRosterLoading(true);
      const res = await attendanceService.getSessionRoster(sessionId);
      if (res?.success) {
        setRosterData(res.data);
      }
    } catch (err) {
      console.error('Error fetching roster:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  const handleStatusToggle = (studentId, nextStatus) => {
    if (!rosterData) return;
    setRosterData((prev) => ({
      ...prev,
      roster: prev.roster.map((item) =>
        item.studentId?._id === studentId ? { ...item, status: nextStatus } : item
      )
    }));
  };

  const handleSaveRoster = async () => {
    if (!selectedSessionId || !rosterData) return;
    try {
      setSavingRoster(true);
      const updates = rosterData.roster.map((item) => ({
        studentId: item.studentId?._id,
        status: item.status
      }));

      const res = await attendanceService.updateBatchAttendance(selectedSessionId, updates);
      if (res?.success) {
        await fetchInitialData(selectedCourseId);
        await fetchRoster(selectedSessionId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save attendance updates.');
    } finally {
      setSavingRoster(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    try {
      setCreating(true);
      const res = await attendanceService.createSession(selectedCourseId, {
        title: newTitle || `Class Session - ${new Date().toLocaleDateString()}`,
        date: newDate,
        sessionType: newType,
        enableOtp,
        otpValidityMinutes: Number(otpValidity)
      });

      if (res?.success) {
        setShowCreateModal(false);
        setNewTitle('');
        await fetchInitialData(selectedCourseId);
        setSelectedSessionId(res.data._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create session.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyOtp = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const currentSession = sessions.find((s) => s._id === selectedSessionId);

  if (loading && !course) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-400 text-sm">Loading attendance manager...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb & Course Switcher */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link to="/faculty/courses" className="hover:text-slate-200 transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Faculty Studio
            </Link>
            <span>/</span>
            <span className="text-slate-200">{course?.title || 'Selected Course'}</span>
            <span>/</span>
            <span className="text-amber-400 font-medium">Attendance Manager</span>
          </div>

          {!paramCourseId && facultyCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Switch Course:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {facultyCourses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-amber-400" />
              Attendance Management Center
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Generate OTP check-in codes, manage live session rosters, and monitor student risk metrics.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!selectedCourseId}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            New Class Session
          </button>
        </div>

        {/* Course Summary Overview Cards */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Enrolled</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{report.totalStudents || 0}</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Total Sessions</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">{report.totalSessions || 0}</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Avg Attendance</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">{report.averageAttendancePercentage || 0}%</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">At-Risk (&lt;75%)</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">{report.atRiskStudentCount || 0}</p>
            </div>
          </div>
        )}

        {/* Live Active OTP Card */}
        {currentSession && currentSession.otpActive && (
          <div className="mb-8 p-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                <KeyRound className="w-3.5 h-3.5" /> Active Session Check-In Code
              </div>
              <h3 className="text-lg font-bold text-white">{currentSession.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Expires at: <span className="text-slate-200 font-mono">{new Date(currentSession.otpExpiresAt).toLocaleTimeString()}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-6 py-3 bg-slate-950 border border-amber-500/50 rounded-2xl font-mono text-3xl font-extrabold text-amber-400 tracking-widest shadow-inner">
                {currentSession.otpCode}
              </span>
              <button
                onClick={() => handleCopyOtp(currentSession.otpCode)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
                title="Copy Code"
              >
                {copiedOtp ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Roster & Session Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Sessions List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Sessions List</span>
              <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-400 rounded-full font-medium">
                {sessions.length}
              </span>
            </h2>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No sessions created yet. Click "New Class Session" to start taking attendance.
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {sessions.map((sess) => (
                  <button
                    key={sess._id}
                    onClick={() => setSelectedSessionId(sess._id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      selectedSessionId === sess._id
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md'
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-100">{sess.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 uppercase text-slate-400">
                        {sess.sessionType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                      <span>{new Date(sess.date).toLocaleDateString()}</span>
                      {sess.otpActive && (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> OTP Active
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Roster Details */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {currentSession ? currentSession.title : 'Session Roster'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manual status toggle & check-in verification
                </p>
              </div>

              {rosterData && (
                <button
                  onClick={handleSaveRoster}
                  disabled={savingRoster}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingRoster ? 'Saving...' : 'Save Attendance'}
                </button>
              )}
            </div>

            {rosterLoading ? (
              <div className="py-16 text-center text-slate-400 text-sm">Loading session roster...</div>
            ) : !rosterData || rosterData.roster?.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">
                No students found in roster for this session.
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {rosterData.roster.map((item) => {
                  const student = item.studentId;
                  if (!student) return null;
                  return (
                    <div
                      key={student._id}
                      className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{student.name}</h4>
                          <span className="text-xs text-slate-400">{student.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusToggle(student._id, st)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              item.status === st
                                ? st === 'PRESENT'
                                  ? 'bg-emerald-500 text-slate-950'
                                  : st === 'ABSENT'
                                  ? 'bg-rose-500 text-white'
                                  : st === 'LATE'
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-indigo-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Full Enrolled Student Attendance Summary Report */}
        {report && report.studentStats && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Enrolled Students Cumulative Attendance Report</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Overall attendance percentages, sessions attended, and low attendance risk warnings (&lt;75%) for all enrolled students.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs px-3 py-1.5 rounded-xl font-bold bg-slate-950 text-slate-300 border border-slate-800">
                  Total Enrolled: {report.studentStats.length} Students
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Attended / Total</th>
                    <th className="py-3.5 px-4">Absences</th>
                    <th className="py-3.5 px-4">Attendance Rate</th>
                    <th className="py-3.5 px-4 text-right">Risk Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {report.studentStats.map((st) => (
                    <tr key={st.studentId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-[10px]">
                            {st.name?.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block">{st.name}</span>
                            <span className="text-[11px] text-slate-400">{st.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">{st.department || 'Computer Science'}</td>

                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {st.presentCount} / {st.totalSessions} sessions
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-rose-400">
                        {st.absentCount}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div
                              className={`h-full rounded-full ${st.isAtRisk ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(st.percentage, 100)}%` }}
                            />
                          </div>
                          <span className={`font-extrabold text-xs ${st.isAtRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {st.percentage}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {st.isAtRisk ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" /> At Risk (&lt;75%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Regular
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                <CalendarCheck className="w-6 h-6 text-amber-400" />
                Create New Class Session
              </h3>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Session Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lecture 5: Binary Trees"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Session Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Session Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="LECTURE">LECTURE</option>
                      <option value="LAB">LAB</option>
                      <option value="TUTORIAL">TUTORIAL</option>
                      <option value="SEMINAR">SEMINAR</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Enable OTP Check-in</span>
                    <input
                      type="checkbox"
                      checked={enableOtp}
                      onChange={(e) => setEnableOtp(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>

                  {enableOtp && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Validity Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={otpValidity}
                        onChange={(e) => setOtpValidity(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FacultyAttendancePage;
