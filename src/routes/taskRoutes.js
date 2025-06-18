const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getTasks, 
  updateTask, 
  deleteTask,
  checkedTask
} = require('../controllers/taskController');
const { isAuthenticated } = require('../middleware/auth');
const { validateTask, validateUpdateTask } = require('../middleware/taskValidation');

router.use(isAuthenticated);
router.post('/', validateTask, createTask);
router.get('/', getTasks);
router.put('/:taskId', validateUpdateTask, updateTask);
router.delete('/:taskId', deleteTask);
router.post('/checked/:taskId', checkedTask); // FAZER VERIFICAR DE DATA -> "Invalid time value"

module.exports = router; 