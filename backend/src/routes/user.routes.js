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

module.exports = router;
