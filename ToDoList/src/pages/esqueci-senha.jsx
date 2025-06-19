import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/login.css';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você enviaria o email para o backend
    navigate('/codigo-recuperacao');
  };

  return (
    <div>
      <h1 className="login_title">ToDoLIST</h1>
      <div className="container">
        <form onSubmit={handleSubmit} className="form">
          <h2 className="title">Recuperar Senha</h2>
          <input
            className="input"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button className="button" type="submit">Enviar código</button>
        </form>
      </div>
    </div>
  );
} 