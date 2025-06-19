import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "teste@teste.com" && senha === "123") {
      navigate("/tarefas");
    } else {
      alert("Email ou senha inválidos");
    }
  };

  return (
    <div>
        <h1 className="login_title">ToDoLIST</h1>
    <div className="container">
      <form onSubmit={handleLogin} className="form">
        <h2 className="title">Login</h2>

        <button
          className="button google-button"
          type="button"
          onClick={() => alert('Funcionalidade de login com Google ainda não implementada!')}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: 20, height: 20, marginRight: 8, verticalAlign: 'middle' }}
          />
          Entrar com Google
        </button>

        <div className="divider"><span>ou</span></div>

        <input
          className="input"
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="input"
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button className="button" type="submit">
          Entrar
        </button>

        <button
          className="button secondary-button"
          type="button"
          onClick={() => navigate('/cadastro')}
        >
          Criar conta
        </button>

        <div className="forgot-link-container">
          <a href="/esqueci-senha" className="forgot-link">Esqueci minha senha</a>
        </div>
      </form>
    </div>
    </div>
  );
}


