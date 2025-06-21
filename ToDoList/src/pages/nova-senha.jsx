import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './css/login.css';
import { URL_BASE_BACKEND } from '../config';

export default function NovaSenha() {
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const location = useLocation();
  const email = location.state?.email;
  const codigo = location.state?.codigo;
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (senha !== confirmar) {
      alert('As senhas não coincidem!');
      return;
    }
    try{
      const response = await fetch(`${URL_BASE_BACKEND}/user/reset-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code: codigo, newPass: senha }),
          });
          const data = await response.json();
          if (response.ok) {
            alert(data.message || "Senha alterada com sucesso!!");
            navigate('/');
          } else {
            alert(data.message || "Não foi possível alterar a senha!");
            navigate('/nova-senha', { state: { email, codigo } });
          }
        } catch (error){
          console.error("Erro:", error);
          alert("Erro ao conectar com o servidor");
          navigate('/nova-senha', { state: { email, codigo } });
        }
        setSenha('');
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