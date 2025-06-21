import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/login.css";
import { URL_BASE_BACKEND } from "../config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${URL_BASE_BACKEND}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await response.json();

       if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Login realizado com sucesso!");
        navigate("/tarefas");
      } else {
        alert(data.message || "Erro ao fazer login");
        navigate("/");
      }
    } catch (error) {
      alert(data.message || 'Erro no login');
      navigate("/");
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


