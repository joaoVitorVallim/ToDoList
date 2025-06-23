import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/login.css';
import { URL_BASE_BACKEND } from '../config';
import { useNotification } from "../context/NotificationContext.jsx";

export default function EsqueciSenha() {
  const { addNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    try {
      const response = await fetch(`${URL_BASE_BACKEND}/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

        if (response.ok) {
          navigate('/codigo-recuperacao', {state: { email }});
        } else {
          addNotification("Erro ao enviar código de recuperação", "error");
          navigate('/esqueci-senha');
        }
      } catch (error) {
        console.error("Erro:", error);
        addNotification("Erro ao conectar com o servidor", "error");
        navigate('/esqueci-senha');
      } finally {
        setLoading(false); 
      }
    
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
            disabled={loading}
          />
          <button className="button" type="submit">
          {loading ? 'Enviando código para o Email...' : 'Enviar código'}
          </button>
        </form>
      </div>
    </div>
  );
} 