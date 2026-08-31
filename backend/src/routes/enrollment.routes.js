const express = require('express');
const EnrollmentController = require('../controllers/enrollment.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Student enrolled courses list
router.get('/courses/my-courses', authorize('STUDENT', 'ADMIN'), EnrollmentController.getMyEnrolledCourses);

// Course enrollment endpoints
router.post('/courses/:courseId/enroll', authorize('STUDENT', 'ADMIN'), EnrollmentController.enroll);
router.get('/courses/:courseId/enrollment', EnrollmentController.checkStatus);

module.exports = router;
