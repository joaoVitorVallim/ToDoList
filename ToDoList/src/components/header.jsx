import { NavLink, Link } from "react-router-dom";
import "./css/header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="todolist_logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="Logo" style={{ height: '36px', width: '36px', objectFit: 'contain' }} />
        ToDoLIST
      </div>
      <nav className="header-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "link active" : "link"}>
          Dashboard
        </NavLink>
        <NavLink to="/tarefas" className={({ isActive }) => isActive ? "link active" : "link"}>
          Tarefas
        </NavLink>
      </nav>
      <Link to="/" className="logout">
        Logout
      </Link>
    </header>
  );
}
