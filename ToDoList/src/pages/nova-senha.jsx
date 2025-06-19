import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/login.css';

export default function NovaSenha() {
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (senha !== confirmar) {
      alert('As senhas não coincidem!');
      return;
    }
    // Aqui você enviaria a nova senha para o backend
    navigate('/');
  };

  return (
    <div>
      <h1 className="login_title">ToDoLIST</h1>
      <div className="container">
        <form onSubmit={handleSubmit} className="form">
          <h2 className="title">Nova Senha</h2>
          <input
            className="input"
            type="password"
            placeholder="Nova senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmar}
            onChange={e => setConfirmar(e.target.value)}
            required
          />
          <button className="button" type="submit">Salvar nova senha</button>
        </form>
      </div>
    </div>
  );
} 