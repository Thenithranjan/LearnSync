import api from './api';

const assessmentService = {
  // Get all assessments for a course
  getCourseAssessments: async (courseId) => {
    const response = await api.get(`/courses/${courseId}/assessments`);
    return response.data;
  },

  // Create an assessment (Faculty / Admin)
  createAssessment: async (courseId, data) => {
    const response = await api.post(`/courses/${courseId}/assessments`, data);
    return response.data;
  },

  // Get assessment details
  getAssessmentById: async (assessmentId) => {
    const response = await api.get(`/assessments/${assessmentId}`);
    return response.data;
  },

  // Update assessment
  updateAssessment: async (assessmentId, data) => {
    const response = await api.put(`/assessments/${assessmentId}`, data);
    return response.data;
  },

  // Delete assessment
  deleteAssessment: async (assessmentId) => {
    const response = await api.delete(`/assessments/${assessmentId}`);
    return response.data;
  },

  // Student: Submit assignment or quiz attempt
  submitAssessment: async (assessmentId, data) => {
    const response = await api.post(`/assessments/${assessmentId}/submit`, data);
    return response.data;
  },

  // Student: Get my submission & result
  getMySubmission: async (assessmentId) => {
    const response = await api.get(`/assessments/${assessmentId}/my-submission`);
    return response.data;
  },

  // Faculty: Get all submissions for an assessment
  getAssessmentSubmissions: async (assessmentId) => {
    const response = await api.get(`/assessments/${assessmentId}/submissions`);
    return response.data;
  },

  // Faculty: Grade submission
  gradeSubmission: async (submissionId, gradeData) => {
    const response = await api.put(`/submissions/${submissionId}/grade`, gradeData);
    return response.data;
  }
};

export default assessmentService;
