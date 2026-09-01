import api from './api';

const attendanceService = {
  // Faculty: Create an attendance session (with optional OTP code)
  createSession: async (courseId, sessionData) => {
    const response = await api.post(`/courses/${courseId}/attendance/sessions`, sessionData);
    return response.data;
  },

  // Get sessions list for a course
  getCourseSessions: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/attendance/sessions`);
    return response.data;
  },

  // Faculty: Get session details and student roster
  getSessionRoster: async (sessionId) => {
    const response = await api.get(`/attendance/sessions/${sessionId}`);
    return response.data;
  },

  // Faculty: Batch mark or update roster attendance
  batchMarkAttendance: async (sessionId, records) => {
    const response = await api.put(`/attendance/sessions/${sessionId}/roster`, { records });
    return response.data;
  },

  // Student: Self check-in using OTP code
  selfCheckIn: async (courseId, otpCode) => {
    const response = await api.post(`/courses/${courseId}/attendance/check-in`, { otpCode });
    return response.data;
  },

  // Student: Get attendance summary & history
  getMyAttendanceSummary: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/attendance/my-summary`);
    return response.data;
  },

  // Faculty: Get full course attendance analytics report
  getCourseAttendanceReport: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/attendance/report`);
    return response.data;
  }
};

export default attendanceService;
