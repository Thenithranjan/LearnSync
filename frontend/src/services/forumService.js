import api from './api';

const forumService = {
  // Get all threads for a course with optional filters (category, search, tag, sort)
  getCourseThreads: async (courseId, params = {}) => {
    const response = await api.get(`/courses/${courseId}/threads`, { params });
    return response.data;
  },

  // Create a new thread
  createThread: async (courseId, threadData) => {
    const response = await api.post(`/courses/${courseId}/threads`, threadData);
    return response.data;
  },

  // Get thread details & complete replies list
  getThreadDetails: async (threadId) => {
    const response = await api.get(`/threads/${threadId}`);
    return response.data;
  },

  // Post reply to a thread
  createReply: async (threadId, replyData) => {
    const response = await api.post(`/threads/${threadId}/replies`, replyData);
    return response.data;
  },

  // Toggle upvote on a thread
  toggleThreadUpvote: async (threadId) => {
    const response = await api.post(`/threads/${threadId}/upvote`);
    return response.data;
  },

  // Toggle upvote on a reply
  toggleReplyUpvote: async (replyId) => {
    const response = await api.post(`/replies/${replyId}/upvote`);
    return response.data;
  },

  // Faculty: Endorse reply as instructor-verified solution
  endorseReply: async (replyId) => {
    const response = await api.put(`/replies/${replyId}/endorse`);
    return response.data;
  },

  // Delete thread
  deleteThread: async (threadId) => {
    const response = await api.delete(`/threads/${threadId}`);
    return response.data;
  }
};

export default forumService;
