import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Module 2 Pages
import CoursesPage from './pages/courses/CoursesPage';
import MyCoursesPage from './pages/courses/MyCoursesPage';
import LearningViewPage from './pages/courses/LearningViewPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import FacultyCoursesPage from './pages/faculty/FacultyCoursesPage';
import CourseContentPage from './pages/faculty/CourseContentPage';

// Module 3 Pages: Assessments & Quizzes
import AssessmentsListPage from './pages/assessments/AssessmentsListPage';
import QuizTakingPage from './pages/assessments/QuizTakingPage';
import AssignmentSubmissionPage from './pages/assessments/AssignmentSubmissionPage';
import CreateAssessmentPage from './pages/faculty/CreateAssessmentPage';
import SubmissionsReviewPage from './pages/faculty/SubmissionsReviewPage';

// Module 4 Pages: Attendance Management
import StudentAttendancePage from './pages/attendance/StudentAttendancePage';
import FacultyAttendancePage from './pages/faculty/FacultyAttendancePage';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Protected General Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Module 2: Course & Digital Learning Routes */}
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <MyCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learning/:courseId"
        element={
          <ProtectedRoute>
            <LearningViewPage />
          </ProtectedRoute>
        }
      />

      {/* Module 3: Assessments & Quizzes Routes */}
      <Route
        path="/courses/:courseId/assessments"
        element={
          <ProtectedRoute>
            <AssessmentsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessments/:assessmentId/quiz"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'FACULTY']}>
            <QuizTakingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessments/:assessmentId/submit"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'FACULTY']}>
            <AssignmentSubmissionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/courses/:courseId/assessments/create"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <CreateAssessmentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessments/:assessmentId/submissions"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <SubmissionsReviewPage />
          </ProtectedRoute>
        }
      />

      {/* Module 4: Attendance Management Routes */}
      <Route
        path="/courses/:courseId/attendance"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'FACULTY']}>
            <StudentAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/courses/:courseId/attendance"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <FacultyAttendancePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Specific Course Routes */}
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminCoursesPage />
          </ProtectedRoute>
        }
      />

      {/* Faculty Specific Course Routes */}
      <Route
        path="/faculty/courses"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <FacultyCoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/courses/:courseId/content"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <CourseContentPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
