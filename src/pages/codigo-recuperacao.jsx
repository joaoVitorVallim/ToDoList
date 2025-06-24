import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/login.css';
import { useNotification } from "../context/NotificationContext.jsx";

const URL_BASE = import.meta.env.VITE_URL_BASE;

export default function CodigoRecuperacao() {
  const { addNotification } = useNotification();
  const location = useLocation();
  const email = location.state?.email;
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  try {
    const response = await fetch(`${URL_BASE}/user/reset-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code: codigo }),
    });
    const data = await response.json();
    if (response.ok) {
      addNotification("Código verificado com sucesso!", "success");
      navigate('/nova-senha', { state: { email, codigo } });
    } else {
      addNotification("Código inválido ou expirado", "error");
      navigate('/codigo-recuperacao', { state: { email } });
    }
  }
  catch (error) {
    console.error("Erro:", error);
    addNotification("Erro ao conectar com o servidor", "error");
    navigate('/codigo-recuperacao', { state: { email } });
  }
  setCodigo('');
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