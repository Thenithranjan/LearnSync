const Thread = require('../models/Thread');
const Reply = require('../models/Reply');
const Course = require('../models/Course');

class ForumService {
  /**
   * Create a new forum thread
   */
  static async createThread(authorId, courseId, data) {
    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    const thread = await Thread.create({
      courseId,
      authorId,
      title: data.title,
      content: data.content,
      category: data.category || 'QUESTION',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? data.tags.split(',').map((t) => t.trim()) : []),
      isPinned: data.isPinned || false
    });

    return await thread.populate('authorId', 'name email role department');
  }

  /**
   * Get all threads for a course with search & filtering
   */
  static async getCourseThreads(courseId, { category, search, tag, sort = 'recent' }) {
    const filter = { courseId };

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { isPinned: -1, createdAt: -1 };
    if (sort === 'popular') sortOptions = { isPinned: -1, upvoteCount: -1, createdAt: -1 };
    if (sort === 'unanswered') sortOptions = { isPinned: -1, replyCount: 1, createdAt: -1 };

    const threads = await Thread.find(filter)
      .populate('authorId', 'name email role department')
      .sort(sortOptions);

    return threads;
  }

  /**
   * Get single thread details + nested replies
   */
  static async getThreadDetails(threadId) {
    const thread = await Thread.findByIdAndUpdate(
      threadId,
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate('courseId', 'title code')
      .populate('authorId', 'name email role department');

    if (!thread) {
      const error = new Error('Thread not found');
      error.statusCode = 404;
      throw error;
    }

    const replies = await Reply.find({ threadId })
      .populate('authorId', 'name email role department')
      .populate('endorsedBy', 'name email')
      .sort({ isFacultyEndorsed: -1, upvoteCount: -1, createdAt: 1 });

    return { thread, replies };
  }

  /**
   * Post a reply to a thread
   */
  static async createReply(authorId, threadId, data) {
    const thread = await Thread.findById(threadId);
    if (!thread) {
      const error = new Error('Thread not found');
      error.statusCode = 404;
      throw error;
    }

    const reply = await Reply.create({
      threadId,
      authorId,
      content: data.content,
      parentReplyId: data.parentReplyId || null
    });

    // Increment thread reply count
    thread.replyCount += 1;
    await thread.save();

    return await reply.populate('authorId', 'name email role department');
  }

  /**
   * Toggle Upvote on a Thread
   */
  static async toggleThreadUpvote(threadId, userId) {
    const thread = await Thread.findById(threadId);
    if (!thread) {
      const error = new Error('Thread not found');
      error.statusCode = 404;
      throw error;
    }

    const hasUpvoted = thread.upvotes.some((id) => id.toString() === userId.toString());
    if (hasUpvoted) {
      thread.upvotes = thread.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      thread.upvotes.push(userId);
    }
    thread.upvoteCount = thread.upvotes.length;
    await thread.save();

    return { upvoted: !hasUpvoted, upvoteCount: thread.upvoteCount };
  }

  /**
   * Toggle Upvote on a Reply
   */
  static async toggleReplyUpvote(replyId, userId) {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      const error = new Error('Reply not found');
      error.statusCode = 404;
      throw error;
    }

    const hasUpvoted = reply.upvotes.some((id) => id.toString() === userId.toString());
    if (hasUpvoted) {
      reply.upvotes = reply.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      reply.upvotes.push(userId);
    }
    reply.upvoteCount = reply.upvotes.length;
    await reply.save();

    return { upvoted: !hasUpvoted, upvoteCount: reply.upvoteCount };
  }

  /**
   * Faculty endorses a reply as official solution
   */
  static async endorseReply(replyId, facultyId) {
    const reply = await Reply.findById(replyId);
    if (!reply) {
      const error = new Error('Reply not found');
      error.statusCode = 404;
      throw error;
    }

    reply.isFacultyEndorsed = !reply.isFacultyEndorsed;
    reply.endorsedBy = reply.isFacultyEndorsed ? facultyId : null;
    reply.endorsedAt = reply.isFacultyEndorsed ? new Date() : null;
    await reply.save();

    // Also mark parent thread as resolved if endorsed
    if (reply.isFacultyEndorsed) {
      await Thread.findByIdAndUpdate(reply.threadId, { isResolved: true });
    }

    return await reply.populate('endorsedBy', 'name email');
  }

  /**
   * Delete thread
   */
  static async deleteThread(threadId, userId, userRole) {
    const thread = await Thread.findById(threadId);
    if (!thread) {
      const error = new Error('Thread not found');
      error.statusCode = 404;
      throw error;
    }

    if (userRole !== 'ADMIN' && thread.authorId.toString() !== userId.toString()) {
      const error = new Error('Not authorized to delete this thread');
      error.statusCode = 403;
      throw error;
    }

    await Thread.findByIdAndDelete(threadId);
    await Reply.deleteMany({ threadId });

    return { message: 'Thread and replies deleted successfully' };
  }
}

module.exports = ForumService;
