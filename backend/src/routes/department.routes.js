const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const DepartmentController = require('../controllers/department.controller');

// Department management is admin-only
router.use(authenticate, authorize('ADMIN'));

router.get('/', DepartmentController.list);
router.post('/', DepartmentController.create);
router.put('/:id', DepartmentController.update);
router.delete('/:id', DepartmentController.remove);

module.exports = router;
