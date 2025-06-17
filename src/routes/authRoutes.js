const express = require('express');
const passport = require('passport');
const router = express.Router();

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
    failureRedirect: '/login',
    failureMessage: true
  }),
  function(req, res) {
    // Autenticação bem-sucedida
    res.json({ 
      message: 'Login realizado com sucesso',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      }
    });
  }
);

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

