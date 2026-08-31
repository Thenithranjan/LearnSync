const express = require('express');
const TestController = require('../controllers/test.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/admin/test', authenticate, authorize('ADMIN'), TestController.adminTest);
router.get('/faculty/test', authenticate, authorize('ADMIN', 'FACULTY'), TestController.facultyTest);
router.get('/student/test', authenticate, authorize('ADMIN', 'FACULTY', 'STUDENT'), TestController.studentTest);

module.exports = router;
