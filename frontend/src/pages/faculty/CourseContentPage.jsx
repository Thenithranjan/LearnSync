import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getCourseDetailsApi } from '../../services/courseService';
import {
  createModuleApi,
  updateModuleApi,
  deleteModuleApi
} from '../../services/moduleService';
import {
  createMaterialApi,
  updateMaterialApi,
  deleteMaterialApi
} from '../../services/materialService';
import {
  ArrowLeft,
  Layers,
  Plus,
  Edit,
  Trash2,
  FileText,
  Video,
  Link as LinkIcon,
  FileCode,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';

const CourseContentPage = () => {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Module Modal State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1,
    isPublished: true
  });

  // Material Modal State
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    type: 'PDF',
    url: '',
    duration: 10,
    order: 1,
    isPublished: true
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCourseDetailsApi(courseId);
      setCourseData(data);
    } catch (err) {
      setError(err.message || 'Failed to load course content.');
    } finally {
      setLoading(false);
    }
  };

  // Module Handlers
  const handleSaveModule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingModule) {
        await updateModuleApi(editingModule._id, moduleForm);
        setSuccessMsg('Module updated successfully!');
      } else {
        await createModuleApi(courseId, moduleForm);
        setSuccessMsg('Module created successfully!');
      }
      setShowModuleModal(false);
      fetchCourseDetails();
    } catch (err) {
      setError(err.message || 'Failed to save module.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Are you sure you want to delete this module? All contained materials will also be affected.')) return;

    try {
      await deleteModuleApi(moduleId);
      setSuccessMsg('Module deleted successfully!');
      fetchCourseDetails();
    } catch (err) {
      setError(err.message || 'Failed to delete module.');
    }
  };

  const openAddModuleModal = () => {
    setEditingModule(null);
    setModuleForm({
      title: '',
      description: '',
      order: (courseData?.modules?.length || 0) + 1,
      isPublished: true
    });
    setShowModuleModal(true);
  };

  const openEditModuleModal = (mod) => {
    setEditingModule(mod);
    setModuleForm({
      title: mod.title,
      description: mod.description || '',
      order: mod.order,
      isPublished: mod.isPublished
    });
    setShowModuleModal(true);
  };

  // Material Handlers
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    if (!activeModuleId && !editingMaterial) return;
    setSubmitting(true);
    setError('');

    try {
      if (editingMaterial) {
        await updateMaterialApi(editingMaterial._id, materialForm);
        setSuccessMsg('Material updated successfully!');
      } else {
        await createMaterialApi(activeModuleId, materialForm);
        setSuccessMsg('Material added successfully!');
      }
      setShowMaterialModal(false);
      fetchCourseDetails();
    } catch (err) {
      setError(err.message || 'Failed to save material.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this learning material?')) return;

    try {
      await deleteMaterialApi(materialId);
      setSuccessMsg('Material deleted successfully!');
      fetchCourseDetails();
    } catch (err) {
      setError(err.message || 'Failed to delete material.');
    }
  };

  const openAddMaterialModal = (moduleId) => {
    setActiveModuleId(moduleId);
    setEditingMaterial(null);
    setMaterialForm({
      title: '',
      description: '',
      type: 'PDF',
      url: '',
      duration: 10,
      order: 1,
      isPublished: true
    });
    setShowMaterialModal(true);
  };

  const openEditMaterialModal = (mat) => {
    setEditingMaterial(mat);
    setMaterialForm({
      title: mat.title,
      description: mat.description || '',
      type: mat.type,
      url: mat.url,
      duration: mat.duration || 0,
      order: mat.order,
      isPublished: mat.isPublished
    });
    setShowMaterialModal(true);
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
        {/* Navigation Back */}
        <div className="flex items-center gap-4">
          <Link
            to="/faculty/courses"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assigned Courses
          </Link>
        </div>

        {/* Course Banner */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-xs font-mono font-bold">
                {courseData?.course?.code}
              </span>
              <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full">
                {courseData?.course?.department}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{courseData?.course?.title}</h1>
            <p className="text-slate-400 text-xs mt-1">{courseData?.course?.description}</p>
          </div>

          <button
            onClick={openAddModuleModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Syllabus Module</span>
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modules & Materials Hierarchy */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading course structure...</p>
          </div>
        ) : !courseData?.modules || courseData.modules.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No Modules Added Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Organize your course syllabus into modules and upload digital materials.
            </p>
            <button
              onClick={openAddModuleModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Module</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {courseData.modules.map((moduleItem, index) => (
              <div
                key={moduleItem._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
              >
                {/* Module Header */}
                <div className="p-4 sm:p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-xs font-mono">
                      {moduleItem.order || index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{moduleItem.title}</h3>
                        {!moduleItem.isPublished && (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] uppercase tracking-wider font-semibold">
                            Draft
                          </span>
                        )}
                      </div>
                      {moduleItem.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{moduleItem.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddMaterialModal(moduleItem._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Material</span>
                    </button>
                    <button
                      onClick={() => openEditModuleModal(moduleItem)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                      title="Edit Module"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(moduleItem._id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all"
                      title="Delete Module"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Materials List */}
                <div className="p-4 sm:p-5 space-y-3">
                  {!moduleItem.materials || moduleItem.materials.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-2">
                      No learning materials uploaded in this module. Click "Add Material" above.
                    </p>
                  ) : (
                    moduleItem.materials.map((mat) => (
                      <div
                        key={mat._id}
                        className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                            {getMaterialIcon(mat.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-200">{mat.title}</span>
                              <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase font-mono bg-slate-800 text-slate-400">
                                {mat.type}
                              </span>
                              {!mat.isPublished && (
                                <span className="text-[10px] text-amber-400 italic">(Hidden)</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate max-w-md">{mat.url}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditMaterialModal(mat)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all text-xs"
                            title="Edit Material"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(mat._id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all text-xs"
                            title="Delete Material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Module Add/Edit Modal */}
        {showModuleModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </h3>
                <button onClick={() => setShowModuleModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModule} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Module Title *</label>
                  <input
                    type="text"
                    required
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    placeholder="e.g. Module 1: Arrays & Memory Allocation"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sequence Order</label>
                    <input
                      type="number"
                      value={moduleForm.order}
                      onChange={(e) => setModuleForm({ ...moduleForm, order: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Visibility</label>
                    <select
                      value={moduleForm.isPublished ? 'true' : 'false'}
                      onChange={(e) => setModuleForm({ ...moduleForm, isPublished: e.target.value === 'true' })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="true">Published</option>
                      <option value="false">Draft (Hidden)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    placeholder="Module learning summary..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModuleModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Module'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Material Add/Edit Modal */}
        {showMaterialModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  {editingMaterial ? 'Edit Learning Material' : 'Add Learning Material'}
                </h3>
                <button onClick={() => setShowMaterialModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMaterial} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Material Title *</label>
                  <input
                    type="text"
                    required
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    placeholder="e.g. Introduction to Dynamic Arrays PDF"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Type *</label>
                    <select
                      value={materialForm.type}
                      onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none"
                    >
                      <option value="PDF">PDF</option>
                      <option value="VIDEO">Video</option>
                      <option value="LINK">Link</option>
                      <option value="DOCUMENT">Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={materialForm.duration}
                      onChange={(e) => setMaterialForm({ ...materialForm, duration: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Resource URL *</label>
                  <input
                    type="url"
                    required
                    value={materialForm.url}
                    onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                    placeholder="https://example.com/lecture.pdf"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    placeholder="Notes or instructions for students..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMaterialModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Material'}
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

export default CourseContentPage;
