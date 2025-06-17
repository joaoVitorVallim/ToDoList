const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.isAuthenticated = async (req, res, next) => {
  try {
    // Verifica se o usuário está autenticado via sessão (Google OAuth)
    if (req.isAuthenticated()) {
      return next();
    }

    // Verifica se há um token JWT
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Não autorizado' });
    }

    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua_chave_secreta_jwt');
    
    // Busca o usuário
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    // Adiciona o usuário ao request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
};
