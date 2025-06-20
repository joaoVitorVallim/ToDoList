import React from 'react';
import './css/taskModal.css';

const TasksList = ({ isOpen, onClose, selectedDate, tasks, onToggleTask, onEditTask, onDeleteTask }) => {
  if (!isOpen) return null;

  const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : '';

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
   * Determina o status de uma tarefa para uma data específica
   * @param {Object} task - Objeto da tarefa
   * @param {Date} date - Data para verificar o status
   * @returns {Object} Objeto com status, classe CSS e se está concluída
   */
  const getTaskStatusForDate = (task, date) => {
    // Converte a data selecionada para string no fuso horário local
    const dateString = dateToLocalString(date);

    // Verifica se a data está no array completed (tarefa já foi marcada como concluída)
    const isCompleted = task.completed && task.completed.some(d => {
      let completedDateString;
      
      // Converte a data completada para string, lidando com diferentes formatos
      if (typeof d === 'string') {
        // Se for string ISO completa (com T), extrai apenas a data
        completedDateString = d.includes('T') ? d.split('T')[0] : d;
      } else if (d instanceof Date) {
        // Se for objeto Date, converte usando nossa função
        completedDateString = dateToLocalString(d);
      } else if (d && d.date) {
        // Se for objeto com propriedade date
        if (typeof d.date === 'string') {
          completedDateString = d.date.includes('T') ? d.date.split('T')[0] : d.date;
        } else {
          completedDateString = dateToLocalString(d.date);
        }
      } else {
        // Fallback para outros tipos
        completedDateString = d.toString();
      }
      
      // Compara se a data completada é igual à data selecionada
      return completedDateString === dateString;
    });

    // Se a tarefa está concluída para esta data, retorna status "Concluída"
    if (isCompleted) {
      return { status: 'Concluída', class: 'status-completed', isCompleted: true };
    }

    // Verifica se a data ainda está em list_dates (tarefa pendente)
    const isInListDates = task.list_dates.some(d => {
      let taskDateString;
      
      // Converte a data da tarefa para string, lidando com diferentes formatos
      if (typeof d === 'string') {
        // Se for string ISO completa (com T), extrai apenas a data
        taskDateString = d.includes('T') ? d.split('T')[0] : d;
      } else if (d instanceof Date) {
        // Se for objeto Date, converte usando nossa função
        taskDateString = dateToLocalString(d);
      } else if (d && d.date) {
        // Se for objeto com propriedade date
        if (typeof d.date === 'string') {
          taskDateString = d.date.includes('T') ? d.date.split('T')[0] : d.date;
        } else {
          taskDateString = dateToLocalString(d.date);
        }
      } else {
        // Fallback para outros tipos
        taskDateString = d.toString();
      }
      
      // Compara se a data da tarefa é igual à data selecionada
      return taskDateString === dateString;
    });

    // Se a data não está em list_dates, significa que foi concluída
    if (!isInListDates) {
      return { status: 'Concluída', class: 'status-completed', isCompleted: true };
    }

    // Obtém a data de hoje no fuso horário local
    const todayString = dateToLocalString(new Date());
    const isToday = dateString === todayString;
    const isPastDay = dateString < todayString; // Comparação de strings funciona para datas YYYY-MM-DD
    
    let hasFailed = false;
    
    // Se é um dia passado, a tarefa falhou
    if (isPastDay) {
      hasFailed = true;
    } 
    // Se é hoje e tem horário definido, verifica se o horário já passou
    else if (isToday && task.time) {
      const [hours, minutes] = task.time.split(':');
      const taskDateTime = new Date();
      taskDateTime.setHours(parseInt(hours), parseInt(minutes), 59, 999); // Define para o final do minuto
      const now = new Date();
      
      // Se o horário da tarefa já passou, ela falhou
      if (taskDateTime < now) {
        hasFailed = true;
      }
    }

    // Retorna o status baseado na verificação de falha
    if (hasFailed) {
      return { status: 'Falhou', class: 'status-failed', isCompleted: false };
    }

    return { status: 'Pendente', class: 'status-pending', isCompleted: false };
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tasks-list-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tarefas do dia {formattedDate}</h2>
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
                {tasks.map(task => {
                  // Obtém o status da tarefa para a data selecionada
                  const { status, class: statusClass, isCompleted } = getTaskStatusForDate(task, selectedDate);
                  
                  // Verifica se a data selecionada é hoje (para habilitar/desabilitar checkbox)
                  const todayString = dateToLocalString(new Date());
                  const isToday = selectedDate && dateToLocalString(selectedDate) === todayString;

                  return (
                    <tr key={task._id} className={`task-item ${isCompleted ? 'completed' : ''}`}>
                      <td>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => onToggleTask(task._id, selectedDate)}
                            disabled={!isToday || status === 'Falhou'}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </td>
                      <td data-label="Título" className="tasklist-title">{task.title}</td>
                      <td data-label="Descrição" className="tasklist-desc">{task.description}</td>
                      <td data-label="Horário" className="tasklist-time">{task.time || '--:--'}</td>
                      <td data-label="Status">
                        <span className={`task-status ${statusClass}`}>{status}</span>
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
                  );
                })}
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