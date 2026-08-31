const express = require('express');
const ProgressController = require('../controllers/progress.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/materials/:id/complete', ProgressController.toggleComplete);
router.get('/courses/:id/progress', ProgressController.getProgress);

module.exports = router;
