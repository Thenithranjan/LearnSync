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
  Check
} from 'lucide-react';

const FacultyAttendancePage = () => {
  const { courseId } = useParams();
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

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [courseRes, sessionsRes, reportRes] = await Promise.all([
        courseService.getCourseById(courseId),
        attendanceService.getCourseSessions(courseId),
        attendanceService.getCourseAttendanceReport(courseId).catch(() => null)
      ]);

      if (courseRes?.success) setCourse(courseRes.data);
      if (sessionsRes?.success) {
        setSessions(sessionsRes.data);
        if (sessionsRes.data.length > 0 && !selectedSessionId) {
          setSelectedSessionId(sessionsRes.data[0]._id);
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
    if (courseId) fetchInitialData();
  }, [courseId]);

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
      roster: prev.roster.map((s) => (s.studentId === studentId ? { ...s, status: nextStatus } : s))
    }));
  };

  const handleMarkAll = (status) => {
    if (!rosterData) return;
    setRosterData((prev) => ({
      ...prev,
      roster: prev.roster.map((s) => ({ ...s, status }))
    }));
  };

  const handleSaveRoster = async () => {
    if (!selectedSessionId || !rosterData) return;
    try {
      setSavingRoster(true);
      const records = rosterData.roster.map((s) => ({
        studentId: s.studentId,
        status: s.status,
        remarks: s.remarks || ''
      }));
      await attendanceService.batchMarkAttendance(selectedSessionId, records);
      alert('Attendance saved successfully!');
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save roster attendance.');
    } finally {
      setSavingRoster(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await attendanceService.createSession(courseId, {
        title: newTitle || `Class Session - ${new Date().toLocaleDateString()}`,
        date: newDate,
        sessionType: newType,
        enableOtp,
        otpValidityMinutes: Number(otpValidity)
      });

      if (res?.success) {
        setShowCreateModal(false);
        setNewTitle('');
        await fetchInitialData();
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/faculty/courses" className="hover:text-slate-200 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Faculty Studio
          </Link>
          <span>/</span>
          <span className="text-slate-200">{course?.title}</span>
          <span>/</span>
          <span className="text-amber-400 font-medium">Attendance Manager</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-amber-400" />
              Attendance Management
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Schedule sessions, generate OTP check-in codes, and manage rosters for <span className="text-slate-200 font-medium">{course?.title}</span>
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Create Class Session
          </button>
        </div>

        {/* Main Content: Session Selector + Roster Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Sessions List */}
          <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Course Sessions ({sessions.length})
            </h3>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No class sessions created yet.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {sessions.map((s) => {
                  const isSelected = s._id === selectedSessionId;
                  return (
                    <button
                      key={s._id}
                      onClick={() => setSelectedSessionId(s._id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-md'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-400">{s.sessionType}</span>
                        <span className="text-[11px] text-slate-400">{new Date(s.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-bold mt-1 line-clamp-1">{s.title}</h4>
                      {s.otpCode && s.isOtpActive && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-300 font-mono">
                          <KeyRound className="w-3 h-3" /> OTP: {s.otpCode}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Active Session Roster Sheet */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            {currentSession ? (
              <div>
                {/* Session Top Bar & OTP Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      {currentSession.sessionType} • {new Date(currentSession.date).toLocaleDateString()}
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-0.5">{currentSession.title}</h2>
                  </div>

                  {currentSession.otpCode && currentSession.isOtpActive && (
                    <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 block">Student Code</span>
                        <span className="text-xl font-mono font-extrabold text-white tracking-widest">
                          {currentSession.otpCode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyOtp(currentSession.otpCode)}
                        className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl transition-colors"
                        title="Copy Code"
                      >
                        {copiedOtp ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Batch Marking Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 my-5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkAll('PRESENT')}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold transition-colors"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={() => handleMarkAll('ABSENT')}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-colors"
                    >
                      Mark All Absent
                    </button>
                  </div>

                  <span className="text-xs text-slate-400">
                    Enrolled Students: <strong className="text-white">{rosterData?.roster?.length || 0}</strong>
                  </span>
                </div>

                {/* Roster Table */}
                {rosterLoading ? (
                  <div className="py-16 text-center text-slate-400">
                    <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-2"></div>
                    <span className="text-xs">Loading roster...</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {rosterData?.roster?.map((student) => (
                      <div
                        key={student.studentId}
                        className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white">{student.name}</h4>
                          <span className="text-xs text-slate-400">{student.email}</span>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1">
                          {['PRESENT', 'LATE', 'ABSENT'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusToggle(student.studentId, status)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                                student.status === status
                                  ? status === 'PRESENT'
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                    : status === 'LATE'
                                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                    : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Save Toolbar */}
                <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-end">
                  <button
                    onClick={handleSaveRoster}
                    disabled={savingRoster || !rosterData}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-600/30 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {savingRoster ? 'Saving Roster...' : 'Save Attendance'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500">
                Select a class session from the left to manage attendance.
              </div>
            )}
          </div>
        </div>

        {/* Modal: Create Class Session */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Create Class Session</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Session Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lecture 4: Graph Traversals"
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Session Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="LECTURE">Lecture</option>
                      <option value="LAB">Lab</option>
                      <option value="TUTORIAL">Tutorial</option>
                      <option value="SEMINAR">Seminar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableOtp}
                      onChange={(e) => setEnableOtp(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                    />
                    Generate 6-digit Student Check-In Code
                  </label>
                </div>

                {enableOtp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Code Validity Window (Minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={otpValidity}
                      onChange={(e) => setOtpValidity(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
                  >
                    {creating ? 'Creating Session...' : 'Create Session'}
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
