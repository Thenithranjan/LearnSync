const express = require('express');
const CourseController = require('../controllers/course.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('ADMIN'), CourseController.create);
router.get('/', CourseController.getAll);
router.get('/faculty/my-courses', authorize('ADMIN', 'FACULTY'), CourseController.getFacultyCourses);
router.get('/:id', CourseController.getById);
router.get('/:id/details', CourseController.getDetails);
router.put('/:id/faculty', authorize('ADMIN'), CourseController.assignFaculty);
router.put('/:id', authorize('ADMIN', 'FACULTY'), CourseController.update);
router.delete('/:id', authorize('ADMIN'), CourseController.delete);

module.exports = router;
