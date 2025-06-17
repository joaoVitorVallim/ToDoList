const User = require('../models/userModel');
const { formatUser } = require('../views/userView');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Busca o usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Verifica a senha
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'sua_chave_secreta_jwt',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login' });
  }
};

// Cadastro
const cadastro = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Cria hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Cria o usuário
    const user = await User.create({
      name,
      email,
      passwordHash
    });

    // Gera o token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'sua_chave_secreta_jwt',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário' });
  }
};

// Buscar usuário atual
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário' });
  }
};

// Listar todos os usuários
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários' });
  }
};

// Deletar usuário
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
};

module.exports = { getUsers, deleteUser, cadastro, login, getCurrentUser };
