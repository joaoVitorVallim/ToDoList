const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask 
} = require('../controllers/taskController');
const { isAuthenticated } = require('../middleware/auth');
const { validateTask } = require('../middleware/taskValidation');

router.use(isAuthenticated);
router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.put('/:taskId', validateTask, updateTask);
router.delete('/:taskId', deleteTask);

module.exports = router; 