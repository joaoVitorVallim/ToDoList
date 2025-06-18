import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./css/dashboard.css";
import Header from "../components/header";

// Função utilitária para simular busca de tarefas do localStorage ou API
function getAllTasks() {
  // Aqui você pode integrar com backend ou localStorage
  const data = localStorage.getItem("tasks");
  if (data) return JSON.parse(data);
  return [];
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    setTasks(getAllTasks());
  }, []);

  // Resumo
  const total = tasks.length;
  const pendentes = tasks.filter(t => t.dates?.some(d => !d.completed && !d.failed)).length;
  const concluidas = tasks.filter(t => t.dates?.some(d => d.completed)).length;
  const falhas = tasks.filter(t => t.dates?.some(d => d.failed)).length;

  // Próximas tarefas (próximos 5 dias)
  const hoje = new Date();
  const proximas = tasks
    .flatMap(t => t.dates?.map(d => ({ ...t, ...d, taskTitle: t.title, taskDesc: t.description, taskTime: t.time })))
    .filter(d => d.date && new Date(d.date) >= hoje && !d.completed && !d.failed)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
        </header>
        <div className="dashboard-cards">
          <div className="dashboard-card total">
            <span>Total de Tarefas</span>
            <strong>{total}</strong>
          </div>
          <div className="dashboard-card pendente">
            <span>Pendentes</span>
            <strong>{pendentes}</strong>
          </div>
          <div className="dashboard-card concluida">
            <span>Concluídas</span>
            <strong>{concluidas}</strong>
          </div>
          <div className="dashboard-card falha">
            <span>Falhas</span>
            <strong>{falhas}</strong>
          </div>
        </div>
        <div className="dashboard-graph-section">
          <h2>Resumo Visual</h2>
          <DashboardPieChart total={total} pendentes={pendentes} concluidas={concluidas} falhas={falhas} />
          <div className="dashboard-legend">
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot pend"></span>Pendentes</span>
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot conc"></span>Concluídas</span>
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot falh"></span>Falhas</span>
          </div>
        </div>
        <div className="dashboard-next-tasks">
          <h2>Próximas tarefas</h2>
          {proximas.length === 0 ? (
            <div className="dashboard-empty">Nenhuma tarefa pendente nos próximos dias.</div>
          ) : (
            <ul>
              {proximas.map((t, i) => (
                <li key={i}>
                  <span className="next-task-date">{new Date(t.date).toLocaleDateString("pt-BR")}</span>
                  <span className="next-task-title">{t.taskTitle}</span>
                  <span className="next-task-desc">{t.taskDesc}</span>
                  <span className="next-task-time">{t.taskTime || "--:--"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

// Gráfico de pizza simples em SVG
function DashboardPieChart({ total, pendentes, concluidas, falhas }) {
  const data = [
    { value: pendentes, color: "#f44336" },
    { value: concluidas, color: "#4caf50" },
    { value: falhas, color: "#ff9800" },
  ];
  const sum = data.reduce((a, b) => a + b.value, 0) || 1;
  let start = 0;
  const circles = data.map((d, i) => {
    const val = (d.value / sum) * 100;
    const dash = `${val} ${100 - val}`;
    const el = (
      <circle
        key={i}
        r="15"
        cx="20"
        cy="20"
        fill="transparent"
        stroke={d.color}
        strokeWidth="10"
        strokeDasharray={dash}
        strokeDashoffset={-start}
      />
    );
    start += (val / 100) * 100;
    return el;
  });
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="dashboard-pie">
      <circle r="15" cx="20" cy="20" fill="#232526" stroke="#333" strokeWidth="10" />
      {circles}
    </svg>
  );
} 