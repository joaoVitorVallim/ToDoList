const User = require('../models/userModel');
const { formatUser } = require('../views/userView');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

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


// Esqueci minha senha
const forgotPassword = async (req, res) => {
    try{ 
      const { email } = req.body;
      if (!email) {
          return res.status(400).json({ message: 'Email é obrigatório' });
      }
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const code = crypto.randomBytes(3).toString('hex'); // Código de 6 caracteres
      const expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

      user.resetCode = code;
      user.resetCodeExpires = expiration;
      await user.save();

      // Enviar e-mail usando utilitário
      await sendEmail({
        to: email,
        subject: 'Código de Recuperação de Senha',
        html: `
          <body style="background: #f4f4f4; padding: 0; margin: 0;">
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px 28px; border: 1px solid #e0e0e0;">
              <h2 style="color: #2e7d32; margin-top: 0; margin-bottom: 18px; font-weight: 700; font-size: 1.6rem; letter-spacing: 1px;">Recuperação de Senha</h2>
              <p style="color: #333; font-size: 1.05rem; margin-bottom: 18px;">Olá <strong>${user.name}</strong>,</p>
              <p style="color: #444; margin-bottom: 18px;">Você solicitou a recuperação da sua senha. Utilize o código abaixo para prosseguir:</p>
              <div style="text-align: center; margin: 18px 0 28px 0;">
                <span style="display: inline-block; background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%); color: #fff; padding: 16px 32px; border-radius: 8px; font-size: 1.25rem; font-weight: bold; letter-spacing: 2px; box-shadow: 0 2px 8px rgba(67,233,123,0.10);">
                  ${code}
                </span>
              </div>
              <p style="color: #333; margin-bottom: 24px;">Este código é válido por <strong>15 minutos</strong>.<br>Se você não solicitou essa alteração, por favor, ignore este e-mail.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 18px 0;">
              <p style="font-size: 12px; color: #aaa; text-align: center;">© 2025 Meu App. Todos os direitos reservados.</p>
            </div>
          </body>
        `
      });

      res.json({ message: 'Código enviado para seu e-mail' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};


const resetPassword = async (req, res) => {
    const { email, code, newPass } = req.body;

    const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (user.resetCode !== code) {
          return res.status(400).json({ message: 'Código inválido' });
      }

      if (user.resetCodeExpires < new Date()) {
          return res.status(400).json({ message: 'Código expirado' });
      }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    user.password = hashedPassword;

    user.resetCode = undefined;
    user.resetCodeExpires = undefined;

    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
};


const resetVerify = async (req, res) => {
    try{
      const { email, code } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      if (user.resetCode !== code) {
          return res.status(400).json({ message: 'Código inválido' });
      }

      if (user.resetCodeExpires < new Date()) {
          return res.status(400).json({ message: 'Código expirado' });
      }
      res.status(200).json({ message: 'Código válido' });
  } catch (error) {
    res.status(500).json({ message: error.message });
    }
};


module.exports = { getUsers, deleteUser, cadastro, login, getCurrentUser, forgotPassword, resetPassword, resetVerify };
