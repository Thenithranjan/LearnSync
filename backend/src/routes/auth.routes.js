const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/me', authenticate, AuthController.getMe);
router.put('/change-password', authenticate, AuthController.changePassword);

module.exports = router;
