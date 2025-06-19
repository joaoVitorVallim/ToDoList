const User = require('../models/userModel');
const { formatUser } = require('../views/userView');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

      // Configurar e-mail
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
          }
      });

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Código de Recuperação de Senha',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                <h2 style="color: #333;">Recuperação de Senha</h2>
                <p>Olá ${user.name},</p>
                <p>Você solicitou a recuperação da sua senha. Utilize o código abaixo para prosseguir:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 25px; border-radius: 5px; font-size: 24px; letter-spacing: 3px;">
                        <strong>${code}</strong>
                    </span>
                </div>

                <p>Este código é válido por <strong>15 minutos</strong>.</p>
                <p>Se você não solicitou essa alteração, por favor, ignore este e-mail.</p>

                <hr style="margin: 30px 0;">
                <p style="font-size: 12px; color: #777;">© 2025 Meu App. Todos os direitos reservados.</p>
            </div>
            `
      };

      await transporter.sendMail(mailOptions);

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
