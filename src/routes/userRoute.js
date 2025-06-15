const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, cadastro } = require('../controllers/userController');

router.get('/', getUsers);
router.delete('/:id', deleteUser);

router.post('/cadastro', cadastro);

module.exports = router;
