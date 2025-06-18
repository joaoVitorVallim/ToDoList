import React, { useState } from 'react';
import './css/taskModal.css';

const TaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    list_dates: [],
    time: '',
    completed: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    if (value) {
      setNewTask(prev => ({
        ...prev,
        list_dates: [...prev.list_dates, value]
      }));
      // Limpa o input após adicionar a data
      e.target.value = '';
    }
  };

  const removeDate = (dateToRemove) => {
    setNewTask(prev => ({
      ...prev,
      list_dates: prev.list_dates.filter(date => date !== dateToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.title.trim() && newTask.list_dates.length > 0) {
      onAddTask(newTask);
      setNewTask({
        title: '',
        description: '',
        list_dates: [],
        time: '',
        completed: false
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-task-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Tarefa</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Título</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Digite o título da tarefa"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                placeholder="Digite a descrição da tarefa"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Horário</label>
              <input
                type="time"
                id="time"
                name="time"
                value={newTask.time}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Adicionar Data</label>
              <div className="date-input-group">
                <input
                  type="date"
                  id="date"
                  onChange={handleDateChange}
                />
              </div>
            </div>

            {newTask.list_dates.length > 0 && (
              <div className="form-group">
                <label>Datas Selecionadas</label>
                <div className="selected-dates">
                  {newTask.list_dates.map((date, index) => (
                    <div key={index} className="date-tag">
                      {new Date(date).toLocaleDateString('pt-BR')}
                      <button
                        type="button"
                        className="remove-date-button"
                        onClick={() => removeDate(date)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="confirm-button"
              disabled={!newTask.title.trim() || newTask.list_dates.length === 0}
            >
              Adicionar Tarefa
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal; 