const express = require('express');

const connectDB = require('./db');
const userRoutes = require('./src/routes/userRoute');

require('dotenv').config();
connectDB();

const app = express();
app.use(express.json());




app.use('/user', userRoutes);





const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));