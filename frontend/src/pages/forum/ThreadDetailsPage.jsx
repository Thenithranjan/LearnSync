import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import forumService from '../../services/forumService';
import useAuth from '../../hooks/useAuth';
import {
  MessageSquare,
  ThumbsUp,
  Award,
  ChevronLeft,
  Send,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
  ShieldCheck,
  Tag,
  AlertCircle
} from 'lucide-react';

const ThreadDetailsPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reply submission
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchThreadData = async () => {
    try {
      setLoading(true);
      const res = await forumService.getThreadDetails(threadId);
      if (res?.success) {
        setThread(res.data.thread);
        setReplies(res.data.replies);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load thread details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (threadId) fetchThreadData();
  }, [threadId]);

  const handleThreadUpvote = async () => {
    try {
      const res = await forumService.toggleThreadUpvote(threadId);
      if (res?.success) {
        setThread((prev) => ({
          ...prev,
          upvoteCount: res.data.upvoteCount
        }));
      }
    } catch (err) {
      console.error('Thread upvote failed:', err);
    }
  };

  const handleReplyUpvote = async (replyId) => {
    try {
      const res = await forumService.toggleReplyUpvote(replyId);
      if (res?.success) {
        setReplies((prev) =>
          prev.map((r) =>
            r._id === replyId ? { ...r, upvoteCount: res.data.upvoteCount } : r
          )
        );
      }
    } catch (err) {
      console.error('Reply upvote failed:', err);
    }
  };

  const handleEndorseReply = async (replyId) => {
    try {
      const res = await forumService.endorseReply(replyId);
      if (res?.success) {
        setReplies((prev) =>
          prev.map((r) =>
            r._id === replyId
              ? {
                  ...r,
                  isFacultyEndorsed: res.data.isFacultyEndorsed,
                  endorsedBy: res.data.endorsedBy
                }
              : r
          )
        );
        if (res.data.isFacultyEndorsed) {
          setThread((prev) => ({ ...prev, isResolved: true }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to endorse answer.');
    }
  };

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      setSubmittingReply(true);
      const res = await forumService.createReply(threadId, { content: replyContent });
      if (res?.success) {
        setReplyContent('');
        setReplies((prev) => [...prev, res.data]);
        setThread((prev) => ({ ...prev, replyCount: (prev.replyCount || 0) + 1 }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!window.confirm('Are you sure you want to delete this discussion topic?')) return;
    try {
      await forumService.deleteThread(threadId);
      navigate(`/courses/${thread.courseId?._id || thread.courseId}/forum`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete thread.');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-400 text-sm">Loading discussion thread...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !thread) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto my-12 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-white">Thread Unavailable</h2>
          <p className="text-sm text-rose-300 mt-1">{error || 'Could not load discussion details.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 text-sm rounded-lg hover:bg-slate-700"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  const isFacultyOrAdmin = user?.role === 'FACULTY' || user?.role === 'ADMIN';
  const canDeleteThread = isFacultyOrAdmin || user?._id === thread.authorId?._id;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-400">
          <Link
            to={`/courses/${thread.courseId?._id || thread.courseId}/forum`}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Forum
          </Link>
        </div>

        {/* Main Question / Topic Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {thread.category}
                </span>
                {thread.isResolved && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Solved
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {thread.title}
              </h1>

              <div className="mt-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {thread.content}
              </div>

              {/* Tags */}
              {thread.tags && thread.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {thread.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-400"
                    >
                      <Tag className="w-3 h-3" /> {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Author Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400">
                    {thread.authorId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">{thread.authorId?.name}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(thread.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleThreadUpvote}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-indigo-400 rounded-xl border border-slate-700/60 font-bold transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{thread.upvoteCount || 0}</span>
                  </button>

                  {canDeleteThread && (
                    <button
                      onClick={handleDeleteThread}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Thread"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Answers & Discussion ({replies.length})
          </h2>
        </div>

        {/* Replies List */}
        <div className="space-y-4 mb-8">
          {replies.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-3xl text-slate-500 text-sm">
              No replies yet. Be the first to share an answer or perspective!
            </div>
          ) : (
            replies.map((reply) => {
              const isEndorsed = reply.isFacultyEndorsed;
              return (
                <div
                  key={reply._id}
                  className={`p-6 bg-slate-900/80 border rounded-3xl transition-all shadow-lg ${
                    isEndorsed
                      ? 'border-amber-500/40 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900'
                      : 'border-slate-800/80'
                  }`}
                >
                  {/* Endorsement Ribbon */}
                  {isEndorsed && (
                    <div className="flex items-center gap-2 mb-3 text-amber-400 text-xs font-bold bg-amber-500/10 px-3 py-1 rounded-xl w-fit border border-amber-500/20">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Instructor Verified Solution</span>
                    </div>
                  )}

                  <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {reply.content}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-[11px]">
                        {reply.authorId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200">{reply.authorId?.name}</span>
                        {reply.authorId?.role === 'FACULTY' && (
                          <span className="ml-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            FACULTY
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReplyUpvote(reply._id)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-400 rounded-xl border border-slate-700 text-xs font-bold transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{reply.upvoteCount || 0}</span>
                      </button>

                      {isFacultyOrAdmin && (
                        <button
                          onClick={() => handleEndorseReply(reply._id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                            isEndorsed
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {isEndorsed ? 'Endorsed ✓' : 'Endorse Solution'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Post Reply Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-base font-bold text-white mb-3">Your Answer / Contribution</h3>
          <form onSubmit={handlePostReply} className="space-y-4">
            <textarea
              rows="4"
              required
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your explanation, code example, or feedback here..."
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            ></textarea>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingReply}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submittingReply ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ThreadDetailsPage;
