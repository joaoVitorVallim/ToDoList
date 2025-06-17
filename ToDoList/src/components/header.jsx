import { Link } from "react-router-dom";
import "./css/header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="todolist_logo">ToDoLIST</div>

        <Link to="/tarefas" className="link">
          Tarefas
        </Link>
        <Link to="/" className="logout">
          Logout
        </Link>
      
    </header>
  );
}
