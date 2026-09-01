import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getCourseDetailsApi } from '../../services/courseService';
import { toggleMaterialCompleteApi } from '../../services/progressService';
import { enrollCourseApi } from '../../services/enrollmentService';
import useAuth from '../../hooks/useAuth';
import {
  BookOpen,
  CheckCircle,
  Circle,
  FileText,
  Video,
  Link as LinkIcon,
  FileCode,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Award,
  AlertCircle,
  Check,
  Play
} from 'lucide-react';

const LearningViewPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [courseDetails, setCourseDetails] = useState(null);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [completedMap, setCompletedMap] = useState({});
  const [progressPct, setProgressPct] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Accordion state
  const [openModules, setOpenModules] = useState({});

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getCourseDetailsApi(courseId);
      setCourseDetails(data);

      const enrolled = data.enrollment?.isEnrolled || user?.role === 'ADMIN' || user?.role === 'FACULTY';
      setIsEnrolled(enrolled);

      // Build completed map & set progress
      const completedIds = data.progress?.completedMaterialIds || [];
      const cMap = {};
      completedIds.forEach((id) => {
        cMap[String(id)] = true;
      });
      setCompletedMap(cMap);
      setProgressPct(data.progress?.progressPercentage || 0);

      // Set initial open modules and active material
      const modules = data.modules || [];
      const initOpen = {};
      let firstMat = null;

      modules.forEach((mod, idx) => {
        initOpen[mod._id] = idx === 0; // expand first module by default
        if (!firstMat && mod.materials && mod.materials.length > 0) {
          firstMat = mod.materials[0];
        }
      });

      setOpenModules(initOpen);
      if (firstMat) {
        setActiveMaterial(firstMat);
      }
    } catch (err) {
      setError(err.message || 'Failed to load course learning content.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (materialId) => {
    if (!isEnrolled && user?.role === 'STUDENT') {
      setError('Please enroll in this course to mark materials complete.');
      return;
    }

    setCompleting(true);
    const currentlyCompleted = !!completedMap[materialId];
    const nextState = !currentlyCompleted;

    try {
      const res = await toggleMaterialCompleteApi(materialId, nextState);
      setCompletedMap((prev) => ({
        ...prev,
        [materialId]: nextState
      }));
      if (res.courseProgressPercentage !== undefined) {
        setProgressPct(res.courseProgressPercentage);
      }
    } catch (err) {
      setError(err.message || 'Failed to update material completion status.');
    } finally {
      setCompleting(false);
    }
  };

  const handleEnrollNow = async () => {
    setEnrolling(true);
    try {
      await enrollCourseApi(courseId);
      setIsEnrolled(true);
      fetchCourseDetails();
    } catch (err) {
      setError(err.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModuleOpen = (moduleId) => {
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'LINK':
        return <LinkIcon className="w-4 h-4 text-emerald-400" />;
      case 'DOCUMENT':
        return <FileCode className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={user?.role === 'STUDENT' ? '/my-courses' : '/courses'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Courses
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to={user?.role === 'FACULTY' || user?.role === 'ADMIN' ? `/faculty/courses/${courseId}/attendance` : `/courses/${courseId}/attendance`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:text-white hover:bg-amber-600 rounded-xl text-xs font-semibold transition-all"
            >
              <CalendarCheck className="w-3.5 h-3.5" /> Attendance
            </Link>

            <Link
              to={`/courses/${courseId}/assessments`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-600 rounded-xl text-xs font-semibold transition-all"
            >
              <Award className="w-3.5 h-3.5" /> Course Assessments
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading course learning environment...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar: Course Modules & Content Outline */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between max-h-[750px] overflow-y-auto">
              <div>
                {/* Course Header */}
                <div className="pb-4 mb-4 border-b border-slate-800">
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono text-[10px] font-bold">
                    {courseDetails?.course?.code}
                  </span>
                  <h2 className="text-base font-bold text-white mt-1 line-clamp-1">
                    {courseDetails?.course?.title}
                  </h2>

                  {/* Progress Indicator */}
                  {user?.role === 'STUDENT' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-indigo-400 font-bold font-mono">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modules Outline */}
                <div className="space-y-2">
                  {!courseDetails?.modules || courseDetails.modules.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No modules available in this course.
                    </p>
                  ) : (
                    courseDetails.modules.map((moduleItem, mIdx) => {
                      const isOpen = !!openModules[moduleItem._id];
                      return (
                        <div
                          key={moduleItem._id}
                          className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/50"
                        >
                          <button
                            onClick={() => toggleModuleOpen(moduleItem._id)}
                            className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                          >
                            <span className="text-xs font-bold text-slate-200 line-clamp-1">
                              {mIdx + 1}. {moduleItem.title}
                            </span>
                            {isOpen ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </button>

                          {isOpen && (
                            <div className="px-2 pb-2 space-y-1">
                              {!moduleItem.materials || moduleItem.materials.length === 0 ? (
                                <p className="text-[11px] text-slate-500 italic p-2">
                                  No materials in module.
                                </p>
                              ) : (
                                moduleItem.materials.map((mat) => {
                                  const isSelected = activeMaterial?._id === mat._id;
                                  const isDone = !!completedMap[mat._id];

                                  return (
                                    <button
                                      key={mat._id}
                                      onClick={() => setActiveMaterial(mat)}
                                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all ${
                                        isSelected
                                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 truncate pr-2">
                                        {getMaterialIcon(mat.type)}
                                        <span className="truncate">{mat.title}</span>
                                      </div>
                                      {isDone ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Enroll Button for non-enrolled students */}
              {!isEnrolled && user?.role === 'STUDENT' && (
                <div className="pt-4 border-t border-slate-800 mt-4">
                  <button
                    onClick={handleEnrollNow}
                    disabled={enrolling}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                  </button>
                </div>
              )}
            </div>

            {/* Main Learning Content Viewer */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between min-h-[600px]">
              {activeMaterial ? (
                <div className="space-y-6">
                  {/* Material Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-bold font-mono uppercase">
                          {activeMaterial.type}
                        </span>
                        {activeMaterial.duration > 0 && (
                          <span className="text-xs text-slate-400">
                            ~{activeMaterial.duration} Mins
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl font-extrabold text-white">{activeMaterial.title}</h1>
                    </div>

                    {/* Completion Action */}
                    {user?.role === 'STUDENT' && (
                      <button
                        onClick={() => handleToggleComplete(activeMaterial._id)}
                        disabled={completing || !isEnrolled}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-lg disabled:opacity-50 ${
                          completedMap[activeMaterial._id]
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        }`}
                      >
                        {completedMap[activeMaterial._id] ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Completed (Click to Undo)</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Mark as Complete</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Material Description */}
                  {activeMaterial.description && (
                    <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs text-slate-300">
                      {activeMaterial.description}
                    </div>
                  )}

                  {/* Material Resource Viewer Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
                    <div className="p-4 bg-slate-900 rounded-2xl w-fit mx-auto border border-slate-800">
                      {getMaterialIcon(activeMaterial.type)}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-200">
                        {activeMaterial.title} Resource Document
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto truncate font-mono">
                        {activeMaterial.url}
                      </p>
                    </div>

                    <a
                      href={activeMaterial.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open Learning Material in New Tab</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 my-auto">
                  <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-300">Select a Material</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Choose a learning material from the syllabus outline on the left to begin studying.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LearningViewPage;
