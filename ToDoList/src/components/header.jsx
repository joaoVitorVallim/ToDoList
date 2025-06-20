import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Bell, BellOff } from "lucide-react";
import "./css/header.css";

const URL_BASE = import.meta.env.VITE_URL_BASE;

export default function Header() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar status de notificação do usuário
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${URL_BASE}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotificationsEnabled(res.data.notificationsEnabled);
      } catch (err) {
        // fallback: assume ativado
        setNotificationsEnabled(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const toggleNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${URL_BASE}/user/notifications`,
        { notificationsEnabled: !notificationsEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotificationsEnabled((prev) => !prev);
    } catch (err) {
      alert("Erro ao atualizar notificações");
    }
  };

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
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {!loading && (
          <button
            className={`notification-btn ${notificationsEnabled ? "active" : "inactive"}`}
            onClick={toggleNotifications}
            title={notificationsEnabled ? "Desativar notificações" : "Ativar notificações"}
          >
            {notificationsEnabled ? <Bell size={28} /> : <BellOff size={28} />}
            <span className="notif-badge" />
          </button>
        )}
        <Link to="/" className="logout">
          Logout
        </Link>
      </div>
    </header>
  );
}
