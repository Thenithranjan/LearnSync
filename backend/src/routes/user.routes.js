const express = require('express');
const UserController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All user profile routes require authentication
router.use(authenticate);

// Admin-only directory listing (must be registered before '/profile' handlers
// so query-based listing never collides with profile paths)
router.get('/', authorize('ADMIN'), UserController.listUsers);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// Admin-only management of other users (registered after '/profile' so the
// literal profile paths always match first)
router.put('/:id', authorize('ADMIN'), UserController.updateUser);
router.delete('/:id', authorize('ADMIN'), UserController.removeUser);

module.exports = router;
