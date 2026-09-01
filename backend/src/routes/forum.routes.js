const express = require('express');
const router = express.Router();
const ForumController = require('../controllers/forum.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Course-level thread routes
router.post(
  '/courses/:courseId/threads',
  authenticate,
  ForumController.createThread
);

router.get(
  '/courses/:courseId/threads',
  authenticate,
  ForumController.getCourseThreads
);

// Individual thread routes & replies
router.get(
  '/threads/:threadId',
  authenticate,
  ForumController.getThreadDetails
);

router.delete(
  '/threads/:threadId',
  authenticate,
  ForumController.deleteThread
);

router.post(
  '/threads/:threadId/replies',
  authenticate,
  ForumController.createReply
);

router.post(
  '/threads/:threadId/upvote',
  authenticate,
  ForumController.toggleThreadUpvote
);

router.post(
  '/replies/:replyId/upvote',
  authenticate,
  ForumController.toggleReplyUpvote
);

// Faculty endorsement route
router.put(
  '/replies/:replyId/endorse',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  ForumController.endorseReply
);

module.exports = router;
