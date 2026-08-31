import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getFacultyCoursesApi } from '../../services/courseService';
import {
  BookOpen,
  Layers,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Building,
  Sparkles
} from 'lucide-react';

const FacultyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFacultyCourses();
  }, []);

  const fetchFacultyCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFacultyCoursesApi();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message || 'Failed to load assigned courses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-900/30 via-slate-900 to-slate-900 border border-amber-500/20 p-6 rounded-2xl shadow-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Content Authoring Studio
          </div>
          <h1 className="text-2xl font-extrabold text-white">Faculty Course Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your assigned courses, structure syllabus modules, and upload digital learning materials.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Assigned Courses Grid */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading your assigned courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No Assigned Courses</h3>
            <p className="text-xs text-slate-500 mt-1">
              You do not have any courses assigned by the Administrator yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-amber-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-mono font-bold">
                      {course.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        course.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {course.department}
                    </span>
                  </div>

                  <Link
                    to={`/faculty/courses/${course._id}/content`}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition-all"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Manage Modules & Content</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FacultyCoursesPage;
