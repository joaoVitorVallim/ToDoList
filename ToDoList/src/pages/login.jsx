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
      </form>
    </div>
    </div>
  );
}


