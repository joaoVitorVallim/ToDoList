const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Rota para iniciar o processo de autenticação Google
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

// Callback do Google após autenticação
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/'
  }),
  function(req, res) {
    // Autenticação bem-sucedida
      const token = generateToken(req.user._id);
      res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    }
  );

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

// Rota para verificar se o usuário está autenticado
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Rota para logout
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { 
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ message: 'Logout realizado com sucesso' });
  });
});

module.exports = router;

