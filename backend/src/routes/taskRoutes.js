const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Task CRUD Endpoints
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTask);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
