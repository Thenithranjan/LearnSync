import api from './api';

export const getCoursesApi = async (params = {}) => {
  const response = await api.get('/courses', { params });
  return response.data;
};

export const getFacultyCoursesApi = async () => {
  const response = await api.get('/courses/faculty/my-courses');
  return response.data;
};

export const getCourseByIdApi = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const getCourseDetailsApi = async (id) => {
  const response = await api.get(`/courses/${id}/details`);
  return response.data;
};

export const createCourseApi = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

export const updateCourseApi = async (id, courseData) => {
  const response = await api.put(`/courses/${id}`, courseData);
  return response.data;
};

export const assignFacultyApi = async (id, facultyId) => {
  const response = await api.put(`/courses/${id}/faculty`, { facultyId });
  return response.data;
};

export const deleteCourseApi = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

const courseService = {
  getCourses: getCoursesApi,
  getFacultyCourses: getFacultyCoursesApi,
  getCourseById: getCourseByIdApi,
  getCourseDetails: getCourseDetailsApi,
  createCourse: createCourseApi,
  updateCourse: updateCourseApi,
  assignFaculty: assignFacultyApi,
  deleteCourse: deleteCourseApi
};

export default courseService;
