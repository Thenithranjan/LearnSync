import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import forumService from '../../services/forumService';
import courseService from '../../services/courseService';
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
  Tag
} from 'lucide-react';

const ForumThreadsPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
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

  const fetchCourseAndThreads = async () => {
    try {
      setLoading(true);
      const [courseRes, threadsRes] = await Promise.all([
        courseService.getCourseById(courseId),
        forumService.getCourseThreads(courseId, {
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
    if (courseId) fetchCourseAndThreads();
  }, [courseId, selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourseAndThreads();
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setCreating(true);
      const res = await forumService.createThread(courseId, {
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: newTags,
        isPinned: newIsPinned
      });

      if (res?.success) {
        setShowModal(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        setNewIsPinned(false);
        fetchCourseAndThreads();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post thread.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpvote = async (e, threadId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await forumService.toggleThreadUpvote(threadId);
      if (res?.success) {
        setThreads((prev) =>
          prev.map((t) =>
            t._id === threadId ? { ...t, upvoteCount: res.data.upvoteCount } : t
          )
        );
      }
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

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link to={`/learning/${courseId}`} className="hover:text-slate-200 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Course
          </Link>
          <span>/</span>
          <span className="text-slate-200 font-medium">Discussion Forum</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-indigo-400" />
              Community & Discussions
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Ask questions, exchange solutions, and collaborate for <span className="text-slate-200 font-medium">{course?.title}</span>
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            New Thread / Question
          </button>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions, tags..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </form>

          {/* Categories Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {['ALL', 'QUESTION', 'DISCUSSION', 'RESOURCE', 'ANNOUNCEMENT'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Upvoted</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>

        {/* Threads List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="mt-4 text-slate-400 text-sm">Loading discussions...</span>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200">No discussions found</h3>
            <p className="text-slate-400 text-sm mt-1">Be the first to ask a question or start a topic!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread._id}
                to={`/threads/${thread._id}`}
                className={`block p-5 sm:p-6 bg-slate-900/80 hover:bg-slate-900 border rounded-3xl transition-all duration-200 group shadow-lg ${
                  thread.isPinned
                    ? 'border-indigo-500/40 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {thread.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      {thread.isResolved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> Solved
                        </span>
                      )}
                      {getCategoryBadge(thread.category)}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {thread.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
                      {thread.content}
                    </p>

                    {/* Tags */}
                    {thread.tags && thread.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {thread.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-medium text-slate-400"
                          >
                            <Tag className="w-2.5 h-2.5" /> {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Author & Timestamp */}
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                      <span className="text-slate-300 font-medium">{thread.authorId?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Upvotes & Replies Counters */}
                  <div className="flex sm:flex-col items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => handleUpvote(e, thread._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 rounded-xl border border-slate-700/60 text-xs font-bold transition-colors"
                      title="Upvote thread"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{thread.upvoteCount || 0}</span>
                    </button>

                    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/40 text-slate-400 rounded-xl text-xs">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{thread.replyCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Modal: Create Thread */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white">Create New Discussion Topic</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateThread} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. How does Dijkstra algorithm handle negative edge weights?"
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    >
                      <option value="QUESTION">Question</option>
                      <option value="DISCUSSION">General Discussion</option>
                      <option value="RESOURCE">Resource Sharing</option>
                      {user?.role !== 'STUDENT' && <option value="ANNOUNCEMENT">Announcement</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="e.g. algorithms, graphs, exam"
                      className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Details / Description</label>
                  <textarea
                    rows="5"
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Provide details, code snippets, or background context..."
                    className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>

                {user?.role !== 'STUDENT' && (
                  <div>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsPinned}
                        onChange={(e) => setNewIsPinned(e.target.checked)}
                        className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500"
                      />
                      Pin this discussion to the top of the forum
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                  >
                    {creating ? 'Publishing...' : 'Publish Thread'}
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
