import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import forumService from '../../services/forumService';
import courseService from '../../services/courseService';
import { getMyEnrolledCoursesApi } from '../../services/enrollmentService';
import useAuth from '../../hooks/useAuth';
import {
  MessageSquare,
  Plus,
  Search,
  ThumbsUp,
  Pin,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Megaphone,
  ChevronLeft,
  Calendar,
  User,
  Eye,
  Tag,
  X
} from 'lucide-react';

const ForumThreadsPage = () => {
  const { courseId: paramCourseId } = useParams();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(paramCourseId || '');
  const [course, setCourse] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');

  // Create Thread Modal state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('QUESTION');
  const [newTags, setNewTags] = useState('');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [creating, setCreating] = useState(false);

  // 1. Fetch available courses if courseId param is missing
  useEffect(() => {
    const initCourses = async () => {
      if (!paramCourseId) {
        try {
          let list = [];
          if (user?.role === 'STUDENT') {
            const res = await getMyEnrolledCoursesApi();
            list = (res.data || []).map((e) => e.course || e);
          } else if (user?.role === 'FACULTY') {
            const res = await courseService.getFacultyCourses();
            list = res.data || [];
          } else {
            const res = await courseService.getCourses({ status: 'PUBLISHED' });
            list = res.data || [];
          }
          setCourses(list);
          if (list.length > 0) {
            setSelectedCourseId(list[0]._id);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error('Error loading courses for forum:', err);
          setLoading(false);
        }
      } else {
        setSelectedCourseId(paramCourseId);
      }
    };
    initCourses();
  }, [paramCourseId, user?.role]);

  // 2. Fetch course and threads when selectedCourseId changes
  const fetchCourseAndThreads = async (targetCourseId) => {
    if (!targetCourseId) return;
    try {
      setLoading(true);
      setError('');
      const [courseRes, threadsRes] = await Promise.all([
        courseService.getCourseById(targetCourseId),
        forumService.getCourseThreads(targetCourseId, {
          category: selectedCategory,
          search: search.trim(),
          sort: sortBy
        })
      ]);

      if (courseRes?.success) setCourse(courseRes.data);
      if (threadsRes?.success) setThreads(threadsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load forum threads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      fetchCourseAndThreads(selectedCourseId);
    }
  }, [selectedCourseId, selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (selectedCourseId) fetchCourseAndThreads(selectedCourseId);
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !selectedCourseId) return;

    try {
      setCreating(true);
      const tagsArray = newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await forumService.createThread(selectedCourseId, {
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: tagsArray,
        isPinned: newIsPinned
      });

      if (res?.success) {
        setShowModal(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        setNewIsPinned(false);
        fetchCourseAndThreads(selectedCourseId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create thread.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpvote = async (threadId, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await forumService.upvoteThread(threadId);
      fetchCourseAndThreads(selectedCourseId);
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'QUESTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle className="w-3 h-3" /> Question
          </span>
        );
      case 'RESOURCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-3 h-3" /> Resource
          </span>
        );
      case 'ANNOUNCEMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Megaphone className="w-3 h-3" /> Announcement
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MessageSquare className="w-3 h-3" /> Discussion
          </span>
        );
    }
  };

  if (loading && !course) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-400 text-sm">Loading discussion forum...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb & Course Switcher */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link to={selectedCourseId ? `/learning/${selectedCourseId}` : '/my-courses'} className="hover:text-slate-200 text-slate-400 text-sm transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Course
          </Link>

          {!paramCourseId && courses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Select Forum Course:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-indigo-400" />
              Community & Discussions
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Ask questions, exchange solutions, and collaborate for <span className="text-slate-200 font-medium">{course?.title || 'Selected Course'}</span>
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            disabled={!selectedCourseId}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            New Thread / Question
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 mb-8 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics, questions, tags..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between sm:justify-end">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
              {['ALL', 'QUESTION', 'RESOURCE', 'ANNOUNCEMENT', 'GENERAL'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-indigo-500"
            >
              <option value="recent">Most Recent</option>
              <option value="upvotes">Most Upvoted</option>
              <option value="replies">Most Active</option>
            </select>
          </div>
        </div>

        {/* Threads List */}
        {threads.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">
            No discussion threads found for this filter criteria. Be the first to start a conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread._id}
                to={`/threads/${thread._id}`}
                className="block bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 transition-all hover:bg-slate-900 shadow-lg group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {thread.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Pin className="w-3 h-3 fill-amber-400" /> Pinned
                        </span>
                      )}
                      {getCategoryBadge(thread.category)}
                      {thread.isSolved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      {thread.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {thread.content}
                    </p>

                    {/* Tags */}
                    {thread.tags?.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {thread.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800"
                          >
                            <Tag className="w-2.5 h-2.5 text-indigo-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thread Meta & Upvote Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <button
                      onClick={(e) => handleUpvote(thread._id, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 text-slate-300 hover:text-indigo-300 text-xs font-bold transition-all"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{thread.upvoteCount || 0}</span>
                    </button>

                    <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <User className="w-3 h-3 text-slate-500" />
                        <span className="font-semibold text-slate-300">{thread.authorId?.name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-3 justify-end text-slate-500">
                        <span>{thread.replyCount || 0} replies</span>
                        <span>•</span>
                        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Thread Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6 text-indigo-400" />
                Create Discussion Thread
              </h3>

              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Thread Title / Question
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. How does TCP checksum verification differ from UDP?"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="QUESTION">QUESTION</option>
                      <option value="RESOURCE">RESOURCE</option>
                      <option value="GENERAL">GENERAL</option>
                      {user?.role !== 'STUDENT' && <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="e.g. TCP, UDP, Networking"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Content / Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe your question or discussion details..."
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                {user?.role !== 'STUDENT' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="pinCheckbox"
                      checked={newIsPinned}
                      onChange={(e) => setNewIsPinned(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <label htmlFor="pinCheckbox" className="text-xs font-bold text-amber-300 cursor-pointer">
                      Pin Thread to Top of Course Forum
                    </label>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Posting...' : 'Post Thread'}
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

export default ForumThreadsPage;
