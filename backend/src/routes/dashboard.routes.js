const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const DashboardController = require('../controllers/dashboard.controller');

// Student dashboard — self + admin
router.get(
  '/dashboard/student',
  authenticate,
  authorize('STUDENT', 'ADMIN'),
  DashboardController.getStudentDashboard
);

// Faculty dashboard — self + admin
router.get(
  '/dashboard/faculty',
  authenticate,
  authorize('FACULTY', 'ADMIN'),
  DashboardController.getFacultyDashboard
);

// Admin dashboard — admin only
router.get(
  '/dashboard/admin',
  authenticate,
  authorize('ADMIN'),
  DashboardController.getAdminDashboard
);

module.exports = router;
