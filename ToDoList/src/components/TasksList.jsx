import React from 'react';
import './css/taskModal.css';

const TasksList = ({ isOpen, onClose, selectedDate, tasks, onToggleTask, onEditTask, onDeleteTask }) => {
  if (!isOpen) return null;

  // Verifica se o dia selecionado é hoje
  const isToday = (() => {
    if (!selectedDate) return false;
    const today = new Date();
    const [d, m, y] = selectedDate.split('/'); // formato pt-BR
    return (
      today.getDate() === Number(d) &&
      today.getMonth() + 1 === Number(m) &&
      today.getFullYear() === Number(y)
    );
  })();

  // Verifica se o dia selecionado é passado
  const isPast = (() => {
    if (!selectedDate) return false;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const [d, m, y] = selectedDate.split('/'); // formato pt-BR
    const selectedDateStart = new Date(Number(y), Number(m) - 1, Number(d));
    return selectedDateStart < todayStart;
  })();

  // Função para marcar tarefa como concluída na data específica
  const handleToggleTask = (taskId) => {
    const [d, m, y] = selectedDate.split('/');
    const targetDate = new Date(Number(y), Number(m) - 1, Number(d));
    onToggleTask(taskId, targetDate);
  };

  // Função para retornar o status textual
  const getStatus = (task) => {
    if (task.completed) return 'Concluída';
    if (task.failed) return 'Falhou';
    return 'Pendente';
  };

  // Função para retornar a classe de cor do status
  const getStatusClass = (task) => {
    if (task.completed) return 'status-completed';
    if (task.failed) return 'status-failed';
    return 'status-pending';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tasks-list-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tarefas do dia {selectedDate}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {tasks.length > 0 ? (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Título</th>
                  <th>Descrição</th>
                  <th>Horário</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className={`task-item${task.completed ? ' completed' : ''}${task.failed ? ' failed' : ''}`}>
                    <td>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          disabled={false}
                        />
                        <span className="checkmark"></span>
                      </label>
                    </td>
                    <td data-label="Título" className="tasklist-title">{task.title}</td>
                    <td data-label="Descrição" className="tasklist-desc">{task.description}</td>
                    <td data-label="Horário" className="tasklist-time">{task.time || '--:--'}</td>
                    <td data-label="Status">
                      <span className={`task-status ${getStatusClass(task)}`}>{getStatus(task)}</span>
                    </td>
                    <td data-label="Ações">
                      <button className="edit-task-btn" title="Editar" onClick={() => onEditTask && onEditTask(task)}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7 2.29a1 1 0 0 1 1.41 0l1.6 1.6a1 1 0 0 1 0 1.41l-9.34 9.34-2.83.71.71-2.83 9.34-9.34ZM3 17h14v2H3v-2Z" fill="currentColor"/></svg>
                      </button>
                      <button className="delete-task-btn" title="Excluir" onClick={() => onDeleteTask && onDeleteTask(task)}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 6h10M7 6v10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6m-7 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-tasks-message">Nenhuma tarefa para este dia</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksList; 