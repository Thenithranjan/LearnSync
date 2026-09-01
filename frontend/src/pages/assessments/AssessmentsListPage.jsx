import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import MainLayout from '../../layouts/MainLayout';
import assessmentService from '../../services/assessmentService';
import courseService from '../../services/courseService';
import {
  FileText,
  HelpCircle,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ChevronLeft,
  Award
} from 'lucide-react';

const AssessmentsListPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'ASSIGNMENT', 'QUIZ'

  useEffect(() => {
    const fetchAssessmentsAndCourse = async () => {
      try {
        setLoading(true);
        const [courseRes, assessRes] = await Promise.all([
          courseService.getCourseById(courseId),
          assessmentService.getCourseAssessments(courseId)
        ]);

        if (courseRes?.success) setCourse(courseRes.data);
        if (assessRes?.success) setAssessments(assessRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchAssessmentsAndCourse();
    }
  }, [courseId]);

  const filteredAssessments = assessments.filter((a) => {
    if (filter === 'ALL') return true;
    return a.type === filter;
  });

  const isFacultyOrAdmin = user?.role === 'FACULTY' || user?.role === 'ADMIN';

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to="/courses" className="hover:text-slate-200 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Courses
          </Link>
          <span>/</span>
          <Link to={`/learning/${courseId}`} className="hover:text-slate-200 transition-colors">
            {course?.title || 'Course Details'}
          </Link>
          <span>/</span>
          <span className="text-indigo-400 font-medium">Assessments</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Award className="w-8 h-8 text-indigo-400" />
              Assessments & Quizzes
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Coursework, submissions, and timed evaluations for <span className="text-slate-200 font-medium">{course?.title}</span>
            </p>
          </div>

          {isFacultyOrAdmin && (
            <Link
              to={`/faculty/courses/${courseId}/assessments/create`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Create Assessment
            </Link>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
          {['ALL', 'ASSIGNMENT', 'QUIZ'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                filter === type
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {type === 'ALL' ? 'All Assessments' : type === 'ASSIGNMENT' ? 'Assignments' : 'Quizzes'}
            </button>
          ))}
        </div>

        {/* Assessments List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="mt-4 text-slate-400 text-sm">Loading coursework...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">
            <Award className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No assessments found</h3>
            <p className="text-slate-400 text-sm mt-1">
              There are no {filter !== 'ALL' ? filter.toLowerCase() + 's' : 'assessments'} scheduled for this course yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredAssessments.map((item) => {
              const isQuiz = item.type === 'QUIZ';
              const targetUrl = isQuiz
                ? `/assessments/${item._id}/quiz`
                : `/assessments/${item._id}/submit`;

              return (
                <div
                  key={item._id}
                  className="bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          isQuiz
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {isQuiz ? <HelpCircle className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                        {item.type}
                      </span>

                      <span className="text-xs font-bold text-slate-400">
                        {item.totalPoints} pts
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                      {item.description || 'No description provided.'}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {isQuiz && item.timeLimitMinutes > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{item.timeLimitMinutes} mins</span>
                        </div>
                      )}

                      {isQuiz && item.questions && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{item.questions.length} questions</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Passing: {item.passingScore}%
                    </span>

                    <div className="flex items-center gap-2">
                      {isFacultyOrAdmin && (
                        <Link
                          to={`/assessments/${item._id}/submissions`}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors"
                        >
                          Review Submissions
                        </Link>
                      )}

                      <Link
                        to={targetUrl}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold rounded-lg transition-all"
                      >
                        <span>{isQuiz ? 'Start Quiz' : 'View & Submit'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AssessmentsListPage;
