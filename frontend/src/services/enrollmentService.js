import api from './api';

export const enrollCourseApi = async (courseId) => {
  const response = await api.post(`/courses/${courseId}/enroll`);
  return response.data;
};

export const getMyEnrolledCoursesApi = async () => {
  const response = await api.get('/courses/my-courses');
  return response.data;
};

export const checkEnrollmentApi = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/enrollment`);
  return response.data;
};
