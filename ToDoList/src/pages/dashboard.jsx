import { useState } from "react";
import { Link } from "react-router-dom";
import "./css/dashboard.css";
import Header from "../components/header";

export default function Dashboard() {
  const [showTaskModal, setShowTaskModal] = useState(false);

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
            <strong>0</strong>
          </div>
          <div className="dashboard-card pendente">
            <span>Pendentes</span>
            <strong>0</strong>
          </div>
          <div className="dashboard-card concluida">
            <span>Concluídas</span>
            <strong>0</strong>
          </div>
          <div className="dashboard-card falha">
            <span>Falhas</span>
            <strong>0</strong>
          </div>
        </div>
        <div className="dashboard-graph-section">
          <h2>Resumo Visual</h2>
          <DashboardPieChart total={0} pendentes={0} concluidas={0} falhas={0} />
          <div className="dashboard-legend">
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot pend"></span>Pendentes</span>
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot conc"></span>Concluídas</span>
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot falh"></span>Falhas</span>
          </div>
        </div>
        <div className="dashboard-next-tasks">
          <h2>Tarefas do dia</h2>
          {/* Lista visual de tarefas do dia (vazia) */}
          <ul></ul>
          <div className="dashboard-empty">Nenhuma tarefa pendente para hoje.</div>
        </div>
        {/* Modal visual ao clicar em uma tarefa */}
        {showTaskModal && (
          <div className="modal-overlay">
            <div className="modal-content add-task-modal">
              <div className="modal-header">
                <h2>Detalhes da Tarefa</h2>
                <button className="close-button" onClick={() => setShowTaskModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p><b>Título:</b> Exemplo de Tarefa</p>
                <p><b>Descrição:</b> Descrição da tarefa</p>
                <p><b>Data:</b> 01/01/2024</p>
                <p><b>Horário:</b> 08:00</p>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24}}>
                  <button className="confirm-button" style={{background: '#888'}} onClick={() => setShowTaskModal(false)}>Fechar</button>
                </div>
              </div>
            </div>
          </div>
        )}
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