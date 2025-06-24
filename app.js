const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const connectDB = require('./db');
const userRoutes = require('./src/routes/userRoute');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
require('./src/utils/taskNotifier');

require('dotenv').config();
require('./src/config/passport');

connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'https://todolist-1-zbwl.onrender.com/',  // Atualize para a porta do seu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true  // Permite envio de cookies de sessão
}));

// Configuração da sessão
app.use(session({
  secret: process.env.SESSION_SECRET || 'sua_chave_secreta_sessao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Rotas
app.use('/user', userRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RODANDO SEUS BROXA !!`));


app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Backend</title>
        <style>
            body {
                background-color: #121212;
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
                padding-top: 20%;
            }
            h1 {
                font-size: 3em;
                margin-bottom: 20px;
            }
            p {
                color: #ccc;
                font-size: 1.2em;
            }
        </style>
    </head>
    <body>
        <h1>🚀 Bem-vindo ao nosso Backend!</h1>
        <p>API funcionando corretamente.</p>
    </body>
    </html>
  `);
});