const express = require('express');
const MaterialController = require('../controllers/material.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Module sub-resource routes: /api/modules/:moduleId/materials-->
router.post('/modules/:moduleId/materials', authorize('ADMIN', 'FACULTY'), MaterialController.create);
router.get('/modules/:moduleId/materials', MaterialController.getByModule);

// Direct material routes: /api/materials/:id-->
router.get('/materials/:id', MaterialController.getById);
router.put('/materials/:id', authorize('ADMIN', 'FACULTY'), MaterialController.update);
router.delete('/materials/:id', authorize('ADMIN', 'FACULTY'), MaterialController.delete);

module.exports = router;
