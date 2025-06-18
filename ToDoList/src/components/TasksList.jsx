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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tasks-list-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tarefas do dia {selectedDate}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="tasks-list">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <li key={task.id} className={task.completed ? 'completed' : ''}>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => isToday && onToggleTask(task.id)}
                      disabled={!isToday}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <span className="task-title">{task.title}</span>
                  <span className="task-description">{task.description}</span>
                  <span className="task-time">{task.time || '--:--'}</span>
                  <div className="task-actions">
                    <button className="edit-task-btn" title="Editar" onClick={() => onEditTask && onEditTask(task)}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7 2.29a1 1 0 0 1 1.41 0l1.6 1.6a1 1 0 0 1 0 1.41l-9.34 9.34-2.83.71.71-2.83 9.34-9.34ZM3 17h14v2H3v-2Z" fill="currentColor"/></svg>
                    </button>
                    <button className="delete-task-btn" title="Excluir" onClick={() => onDeleteTask && onDeleteTask(task.id)}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 6h10M7 6v10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V6m-7 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="no-tasks">Nenhuma tarefa para este dia</li>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksList; 