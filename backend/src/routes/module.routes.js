const express = require('express');
const ModuleController = require('../controllers/module.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Course sub-resource routes: /api/courses/:courseId/modules
router.post('/courses/:courseId/modules', authorize('ADMIN', 'FACULTY'), ModuleController.create);
router.get('/courses/:courseId/modules', ModuleController.getByCourse);

// Direct module routes: /api/modules/:id
router.get('/modules/:id', ModuleController.getById);
router.put('/modules/:id', authorize('ADMIN', 'FACULTY'), ModuleController.update);
router.delete('/modules/:id', authorize('ADMIN', 'FACULTY'), ModuleController.delete);

module.exports = router;
