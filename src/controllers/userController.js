const User = require('../models/userModel');
const { formatUser } = require('../views/userView');
const bcrypt = require('bcrypt');


async function cadastro(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: "Todos os campos são obrigatórios: name, email e password" 
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                error: "Formato de email inválido" 
            });
        }
        if (password.length < 6) {
            return res.status(400).json({ 
                error: "A senha deve ter pelo menos 6 caracteres" 
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: "Este email já está cadastrado" 
            });
        }
        const salt = 12;
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, passwordHash });
        return res.status(201).json(formatUser(user));
    } catch (error) {
        console.error('Erro no cadastro:', error);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao cadastrar usuário" 
        });
    }
}


async function getUsers(req, res) {
    try {
        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "Nenhum usuário encontrado" });
        }

        res.status(200).json(users.map(formatUser));
    } catch (error) {
        res.status(500).json({ error: "Erro interno do servidor ao buscar usuários" });
    }
}


async function deleteUser (req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID do usuário é obrigatório!" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado"});
    }

    res.json({message: "Usuário deletado com sucesso"});
  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

module.exports = { getUsers, deleteUser, cadastro };
