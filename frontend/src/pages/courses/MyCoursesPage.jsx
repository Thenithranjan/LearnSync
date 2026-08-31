import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getMyEnrolledCoursesApi } from '../../services/enrollmentService';
import { getCourseProgressApi } from '../../services/progressService';
import {
  BookOpen,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Building,
  BarChart2,
  PlayCircle
} from 'lucide-react';

const MyCoursesPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyEnrolledCoursesApi();
      const enrolledItems = data.enrollments || [];
      setEnrollments(enrolledItems);

      // Fetch progress for each course
      const progressResults = {};
      for (const item of enrolledItems) {
        if (item.courseId?._id) {
          try {
            const pData = await getCourseProgressApi(item.courseId._id);
            progressResults[item.courseId._id] = pData.progressPercentage || 0;
          } catch (e) {
            progressResults[item.courseId._id] = 0;
          }
        }
      }
      setProgressMap(progressResults);
    } catch (err) {
      setError(err.message || 'Failed to load enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 rounded-2xl shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Enrolled Learning Hub
          </div>
          <h1 className="text-2xl font-extrabold text-white">My Enrolled Courses</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your ongoing courses, progress metrics, and complete digital learning materials.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Enrolled Courses Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading your enrolled courses...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No Enrolled Courses</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              You have not enrolled in any academic courses yet.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((item) => {
              const course = item.courseId;
              if (!course) return null;
              const progressPct = progressMap[course._id] || 0;

              return (
                <div
                  key={item._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-indigo-500/30 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-mono font-bold">
                        {course.code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Active Student
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" /> Course Completion
                        </span>
                        <span className="text-indigo-400 font-bold font-mono">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link
                      to={`/learning/${course._id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Continue Learning</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </Link>
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

export default MyCoursesPage;
