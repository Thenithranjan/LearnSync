const ForumService = require('../services/forum.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

class ForumController {
  static async createThread(req, res, next) {
    try {
      const { courseId } = req.params;
      const thread = await ForumService.createThread(
        req.user._id,
        courseId,
        req.body
      );
      return sendSuccess(res, 201, 'Discussion thread created successfully', { data: thread });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseThreads(req, res, next) {
    try {
      const { courseId } = req.params;
      const threads = await ForumService.getCourseThreads(courseId, req.query);
      return sendSuccess(res, 200, 'Course threads retrieved', { data: threads });
    } catch (error) {
      next(error);
    }
  }

  static async getThreadDetails(req, res, next) {
    try {
      const { threadId } = req.params;
      const data = await ForumService.getThreadDetails(threadId);
      return sendSuccess(res, 200, 'Thread details retrieved', { data });
    } catch (error) {
      next(error);
    }
  }

  static async createReply(req, res, next) {
    try {
      const { threadId } = req.params;
      const reply = await ForumService.createReply(
        req.user._id,
        threadId,
        req.body
      );
      return sendSuccess(res, 201, 'Reply posted successfully', { data: reply });
    } catch (error) {
      next(error);
    }
  }

  static async toggleThreadUpvote(req, res, next) {
    try {
      const { threadId } = req.params;
      const result = await ForumService.toggleThreadUpvote(threadId, req.user._id);
      return sendSuccess(res, 200, 'Thread upvote updated', { data: result });
    } catch (error) {
      next(error);
    }
  }

  static async toggleReplyUpvote(req, res, next) {
    try {
      const { replyId } = req.params;
      const result = await ForumService.toggleReplyUpvote(replyId, req.user._id);
      return sendSuccess(res, 200, 'Reply upvote updated', { data: result });
    } catch (error) {
      next(error);
    }
  }

  static async endorseReply(req, res, next) {
    try {
      const { replyId } = req.params;
      const reply = await ForumService.endorseReply(replyId, req.user._id);
      return sendSuccess(res, 200, 'Reply endorsement status updated', { data: reply });
    } catch (error) {
      next(error);
    }
  }

  static async deleteThread(req, res, next) {
    try {
      const { threadId } = req.params;
      const result = await ForumService.deleteThread(threadId, req.user._id, req.user.role);
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ForumController;
