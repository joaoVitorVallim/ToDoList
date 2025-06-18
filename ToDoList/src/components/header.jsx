import { Link } from "react-router-dom";
import "./css/header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="todolist_logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
        ToDoLIST
      </div>

        <Link to="/tarefas" className="link">
          Tarefas
        </Link>
        <Link to="/" className="logout">
          Logout
        </Link>
      
    </header>
  );
}
