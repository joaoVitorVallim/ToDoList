import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import "./css/dashboard.css";
import Header from "../components/header";

const URL_BASE = import.meta.env.VITE_URL_BASE;

export default function Dashboard() {
  // Estados para controlar a interface
  const [showTaskModal, setShowTaskModal] = useState(false); // Controla exibição do modal de detalhes
  const [selectedTask, setSelectedTask] = useState(null); // Tarefa selecionada para mostrar detalhes
  const [tasks, setTasks] = useState([]); // Lista de todas as tarefas do usuário
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [selectedDate, setSelectedDate] = useState(new Date()); // Data selecionada para visualizar tarefas

  /**
   * Busca todas as tarefas do usuário no backend
   * Executada quando o componente é montado
   */
  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get( `${URL_BASE}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca tarefas quando o componente é montado
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Navega entre os dias (anterior, próximo, hoje)
   * @param {string} direction - Direção da navegação ('prev', 'next', 'today')
   */
  const navigateDate = (direction) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1); // Dia anterior
      } else if (direction === 'next') {
        newDate.setDate(newDate.getDate() + 1); // Próximo dia
      } else if (direction === 'today') {
        newDate.setTime(new Date().getTime()); // Volta para hoje
      }
      return newDate;
    });
  };

  /**
   * Converte uma data para string no formato YYYY-MM-DD no fuso horário local
   * Evita problemas de fuso horário que ocorrem com toISOString()
   * @param {Date} date - Data a ser convertida
   * @returns {string} Data no formato YYYY-MM-DD
   */
  const dateToLocalString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 porque getMonth() retorna 0-11
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Calcula estatísticas gerais das tarefas (total, pendentes, concluídas, falhas)
   * @returns {Object} Objeto com as estatísticas calculadas
   */
  const calculateStats = () => {
    const todayString = dateToLocalString(new Date());
    let total = 0;
    let pendentes = 0;
    let concluidas = 0;
    let falhas = 0;

    // Itera sobre todas as tarefas
    tasks.forEach((task) => {
      // Conta tarefas em list_dates (pendentes ou falhas)
      task.list_dates.forEach((date) => {
        total++;
        
        // Converte a data da tarefa para string, lidando com diferentes formatos
        let dateString;
        if (typeof date === 'string') {
          dateString = date.includes('T') ? date.split('T')[0] : date;
        } else if (date instanceof Date) {
          dateString = dateToLocalString(date);
        } else if (date && date.date) {
          if (typeof date.date === 'string') {
            dateString = date.date.includes('T') ? date.date.split('T')[0] : date.date;
          } else {
            dateString = dateToLocalString(date.date);
          }
        } else {
          dateString = date.toString();
        }
        
        // Compara a data da tarefa com hoje para determinar status
        const taskDate = new Date(dateString);
        const todayDate = new Date(todayString);
        
        // Normaliza para comparar apenas a data (sem horário)
        taskDate.setHours(0, 0, 0, 0);
        todayDate.setHours(0, 0, 0, 0);
        
        const isPastDay = taskDate < todayDate;
        const isToday = taskDate.getTime() === todayDate.getTime();
        
        let hasFailed = isPastDay;
        
        // Se for hoje, verifica o horário para determinar se falhou
        if (isToday && task.time) {
          const [hours, minutes] = task.time.split(':');
          const taskDateTime = new Date();
          taskDateTime.setHours(parseInt(hours), parseInt(minutes), 59, 999);
          const now = new Date();
          
          if (taskDateTime < now) {
            hasFailed = true;
          }
        }
        
        // Incrementa contadores baseado no status
        if (hasFailed) {
          falhas++;
        } else {
          pendentes++;
        }
      });

      // Conta tarefas em completed (concluídas)
      if (task.completed) {
        task.completed.forEach(() => {
          total++;
          concluidas++;
        });
      }
    });

    return { total, pendentes, concluidas, falhas };
  };

  /**
   * Obtém as tarefas para uma data específica
   * @param {Date} date - Data para buscar tarefas
   * @returns {Array} Array de tarefas para a data especificada
   */
  const getTasksForDate = (date) => {
    const dateString = dateToLocalString(date);
    const tasksForDate = [];

    // Itera sobre todas as tarefas
    tasks.forEach(task => {
      // Verifica tarefas pendentes do dia
      task.list_dates.forEach(taskDate => {
        let taskDateString;
        
        // Converte a data da tarefa para string, lidando com diferentes formatos
        if (typeof taskDate === 'string') {
          // Se for uma string ISO completa, extrai apenas a data
          if (taskDate.includes('T')) {
            taskDateString = taskDate.split('T')[0];
          } else {
            taskDateString = taskDate;
          }
        } else if (taskDate instanceof Date) {
          taskDateString = dateToLocalString(taskDate);
        } else if (taskDate && taskDate.date) {
          if (typeof taskDate.date === 'string') {
            taskDateString = taskDate.date.includes('T') ? taskDate.date.split('T')[0] : taskDate.date;
          } else {
            taskDateString = dateToLocalString(taskDate.date);
          }
        } else {
          taskDateString = taskDate.toString();
        }
        
        // Se a data da tarefa corresponde à data selecionada
        if (taskDateString === dateString) {
          // Determina o status da tarefa baseado na data e horário
          let status = 'pendente';
          
          const selectedDateOnly = new Date(dateString);
          const todayDate = new Date();
          const todayString = dateToLocalString(todayDate);
          
          // Se a data selecionada é anterior a hoje, todas as tarefas falharam
          if (dateString < todayString) {
            status = 'falha';
          } 
          // Se a data selecionada é hoje, verifica o horário
          else if (dateString === todayString && task.time) {
            const [hours, minutes] = task.time.split(':');
            const taskDateTime = new Date();
            taskDateTime.setHours(parseInt(hours), parseInt(minutes), 59, 999);
            const now = new Date();
            
            if (taskDateTime < now) {
              status = 'falha';
            }
          }
          // Se a data selecionada é futura, todas as tarefas são pendentes

          // Adiciona a tarefa à lista com seu status
          tasksForDate.push({
            ...task,
            status,
            date: taskDateString
          });
        }
      });

      // Verifica tarefas concluídas do dia
      if (task.completed) {
        task.completed.forEach(completedDate => {
          let completedDateString;
          
          // Converte a data completada para string, lidando com diferentes formatos
          if (typeof completedDate === 'string') {
            if (completedDate.includes('T')) {
              completedDateString = completedDate.split('T')[0];
            } else {
              completedDateString = completedDate;
            }
          } else if (completedDate instanceof Date) {
            completedDateString = dateToLocalString(completedDate);
          } else if (completedDate && completedDate.date) {
            if (typeof completedDate.date === 'string') {
              completedDateString = completedDate.date.includes('T') ? completedDate.date.split('T')[0] : completedDate.date;
            } else {
              completedDateString = dateToLocalString(completedDate.date);
            }
          } else {
            completedDateString = completedDate.toString();
          }
          
          // Se a data completada corresponde à data selecionada
          if (completedDateString === dateString) {
            tasksForDate.push({
              ...task,
              status: 'concluida',
              date: completedDateString
            });
          }
        });
      }
    });

    // Ordena as tarefas por horário
    return tasksForDate.sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return 0;
    });
  };

  /**
   * Abre o modal de detalhes da tarefa
   * @param {Object} task - Tarefa selecionada
   */
  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Calcula estatísticas e tarefas do dia selecionado
  const stats = calculateStats();
  const todayTasks = getTasksForDate(selectedDate);

  // Tela de carregamento
  if (loading) {
    return (
      <>
        <Header />
        <div className="dashboard-container">
          <div style={{ textAlign: 'center', color: '#fff', padding: '50px' }}>
            Carregando dashboard...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        {/* Cabeçalho da dashboard */}
        <header className="dashboard-header">
          <h1>Dashboard</h1>
        </header>
        
        {/* Cards de estatísticas */}
        <div className="dashboard-cards">
          <div className="dashboard-card total">
            <span>Total de Tarefas</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="dashboard-card pendente">
            <span>Pendentes</span>
            <strong>{stats.pendentes}</strong>
          </div>
          <div className="dashboard-card concluida">
            <span>Concluídas</span>
            <strong>{stats.concluidas}</strong>
          </div>
          <div className="dashboard-card falha">
            <span>Falhas</span>
            <strong>{stats.falhas}</strong>
          </div>
        </div>
        
        {/* Seção do gráfico visual */}
        <div className="dashboard-graph-section">
          <h2>Resumo Visual</h2>
          <DashboardPieChart 
            total={stats.total} 
            pendentes={stats.pendentes} 
            concluidas={stats.concluidas} 
            falhas={stats.falhas} 
          />
          <div className="dashboard-legend">
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot pend"></span>Pendentes</span>
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot conc"></span>Concluídas</span>
            <span className="dashboard-legend-item"><span className="dashboard-legend-dot falh"></span>Falhas</span>
          </div>
        </div>
        
        {/* Seção de tarefas do dia */}
        <div className="dashboard-next-tasks">
          {/* Cabeçalho com navegação de datas */}
          <div className="dashboard-date-header">
            <button 
              className="date-nav-btn" 
              onClick={() => navigateDate('prev')}
              title="Dia anterior"
            >
              ←
            </button>
            <div className="date-title-container">
              <h2>
                Tarefas do dia {selectedDate.toLocaleDateString('pt-BR')}
                {/* Indica se é hoje */}
                {selectedDate.toDateString() === new Date().toDateString() && (
                  <span className="today-indicator"> (Hoje)</span>
                )}
              </h2>
              {/* Botão para voltar para hoje se não estiver no dia atual */}
              {selectedDate.toDateString() !== new Date().toDateString() && (
                <button 
                  className="today-btn"
                  onClick={() => navigateDate('today')}
                >
                  Voltar para hoje
                </button>
              )}
            </div>
            <button 
              className="date-nav-btn" 
              onClick={() => navigateDate('next')}
              title="Próximo dia"
            >
              →
            </button>
          </div>
          
          {/* Lista de tarefas do dia selecionado */}
          {todayTasks.length > 0 ? (
            <ul>
              {todayTasks.map((task, index) => (
                <li key={`${task._id}-${index}`} onClick={() => handleTaskClick(task)}>
                  <div className="next-task-date">
                    {task.date.split('-').reverse().join('/')}
                  </div>
                  <div className="next-task-title">{task.title}</div>
                  <div className="next-task-desc">{task.description}</div>
                  {task.time && (
                    <div className="next-task-time">{task.time}</div>
                  )}
                  <div className={`task-status ${task.status === 'concluida' ? 'status-completed' : task.status === 'falha' ? 'status-failed' : 'status-pending'}`}>
                    {task.status === 'concluida' ? 'Concluída' : task.status === 'falha' ? 'Falhou' : 'Pendente'}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="dashboard-empty">Nenhuma tarefa para este dia.</div>
          )}
        </div>
        
        {/* Modal de detalhes da tarefa */}
        {showTaskModal && selectedTask && (
          <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="modal-content add-task-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalhes da Tarefa</h2>
                <button className="close-button" onClick={() => setShowTaskModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p><b>Título:</b> {selectedTask.title}</p>
                <p><b>Descrição:</b> {selectedTask.description}</p>
                <p><b>Data:</b> {selectedTask.date.split('-').reverse().join('/')}</p>
                {selectedTask.time && <p><b>Horário:</b> {selectedTask.time}</p>}
                <p><b>Status:</b> {selectedTask.status === 'concluida' ? 'Concluída' : 'Pendente'}</p>
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

/**
 * Componente de gráfico de pizza simples em SVG
 * Mostra a distribuição das tarefas por status
 * @param {number} total - Total de tarefas
 * @param {number} pendentes - Tarefas pendentes
 * @param {number} concluidas - Tarefas concluídas
 * @param {number} falhas - Tarefas que falharam
 */
function DashboardPieChart({ total, pendentes, concluidas, falhas }) {
  // Dados para o gráfico
  const data = [
    { value: pendentes, color: "#f44336" }, // Vermelho para pendentes
    { value: concluidas, color: "#4caf50" }, // Verde para concluídas
    { value: falhas, color: "#ff9800" }, // Laranja para falhas
  ];
  
  const sum = data.reduce((a, b) => a + b.value, 0) || 1; // Evita divisão por zero
  let start = 0;
  
  // Cria os segmentos do gráfico
  const circles = data.map((d, i) => {
    const val = (d.value / sum) * 100; // Calcula a porcentagem
    const dash = `${val} ${100 - val}`; // Define o dash array para criar o segmento
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
        strokeDashoffset={-start} // Posiciona o segmento
      />
    );
    start += (val / 100) * 100; // Atualiza a posição inicial para o próximo segmento
    return el;
  });
  
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="dashboard-pie">
      {/* Círculo de fundo */}
      <circle r="15" cx="20" cy="20" fill="#232526" stroke="#333" strokeWidth="10" />
      {/* Segmentos do gráfico */}
      {circles}
    </svg>
  );
} 