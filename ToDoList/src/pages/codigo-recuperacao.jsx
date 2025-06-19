import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/login.css';

export default function CodigoRecuperacao() {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você validaria o código no backend
    navigate('/nova-senha');
  };

  return (
    <div>
      <h1 className="login_title">ToDoLIST</h1>
      <div className="container">
        <form onSubmit={handleSubmit} className="form">
          <h2 className="title">Digite o código recebido</h2>
          <input
            className="input"
            type="text"
            placeholder="Código de verificação"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            required
          />
          <button className="button" type="submit">Verificar código</button>
        </form>
      </div>
    </div>
  );
} 