import './css/login.css';

export default function Cadastro() {
  return (
    <div>
      <h1 className="login_title">ToDoLIST</h1>
      <div className="container">
        <form className="form">
          <h2 className="title">Cadastro</h2>
          <input className="input" type="text" placeholder="Nome" />
          <input className="input" type="email" placeholder="Email" required />
          <input className="input" type="password" placeholder="Senha" required />
          <input className="input" type="password" placeholder="Confirmar senha" required />
          <button className="button" type="button">Cadastrar</button>
          <div className="forgot-link-container">
            <a href="/" className="forgot-link">Já tem conta? Entrar</a>
          </div>
        </form>
      </div>
    </div>
  );
}
