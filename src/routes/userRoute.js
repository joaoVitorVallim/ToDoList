const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  deleteUser, 
  cadastro, 
  login,
  getCurrentUser
} = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/register', cadastro);
router.post('/login', login);

router.get('/me', isAuthenticated, getCurrentUser);
router.get('/', isAuthenticated, getUsers);
router.delete('/:id', isAuthenticated, deleteUser);

module.exports = router;
