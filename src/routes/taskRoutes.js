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
router.get('/', getTasks);
router.post('/', validateTask, createTask);
router.post('/checked/:taskId', checkedTask);
router.put('/:taskId', validateUpdateTask, updateTask);
router.delete('/:taskId', deleteTask); // All dates
router.delete('/:taskId/:date', deleteTask); // Specific date

module.exports = router;