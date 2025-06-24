import './css/login.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useNotification } from "../context/NotificationContext.jsx";

const URL_BASE = import.meta.env.VITE_URL_BASE;

export default function Cadastro() {
  const { addNotification } = useNotification();
  const [ nome, setNome ] = useState("");
  const [ email, setEmail ] = useState("");
  const [ senha, setSenha ] = useState("");
  const [ confirmar_senha, setConfirmar_senha ] = useState("");

  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();
    if (senha !== confirmar_senha) {
      addNotification('As senhas não coincidem!', "error");
      return;
    }

    try {
      const registerData = {
        name: nome.trim(),
        email: email.trim(),
        password: senha.trim()
      };

      const response = await axios.post(
        `${URL_BASE}/user/register`,
        registerData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      localStorage.setItem("token", response.data.token);
      addNotification(response.data.message || "Cadastro realizado com sucesso!", "success");
      navigate("/tarefas");

      } catch (error) {
        const errorMessage = error.response?.data?.message || "Erro ao cadastrar";
        addNotification(errorMessage, "error");
        navigate("/cadastro");
      }

  }


  return (
    <div>
      <h1 className="login_title">ToDoLIST</h1>
      <div className="container">
        <form onSubmit={handleCadastro} className="form">
          <h2 className="title">Cadastro</h2>

          <input 
            className="input" 
            type="text" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome"
            required
           />

          <input 
            className="input" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Email" 
            required 
          />

          <input 
            className="input" 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            placeholder="Senha" 
            required 
          />

          <input 
            className="input" 
            type="password" 
            value={confirmar_senha} 
            onChange={(e) => setConfirmar_senha(e.target.value)} 
            placeholder="Confirmar senha" 
            required 
          />

          <button className="button" type="submit">
              Cadastrar
          </button>

          <div className="forgot-link-container">
            <a href="/" className="forgot-link">Já tem conta? Entrar</a>
          </div>
        </form>
      </div>
    </div>
  );
}
