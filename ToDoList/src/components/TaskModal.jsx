import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './css/taskModal.css';

export default function TaskModal({ date, tasks, onClose, onToggleTask, showAddTask, onAddTask, onCloseAddTask }) {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    list_dates: [],
    time: '',
    completed: false,
    createdAt: new Date()
  });
  const [selectAllYear, setSelectAllYear] = useState(false);
  const [selectPeriod, setSelectPeriod] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const handleAddTask = () => {
    if (newTask.title.trim() && newTask.description.trim() && newTask.list_dates.length > 0) {
      onAddTask({
        ...newTask,
        createdAt: new Date()
      });
      setNewTask({
        title: '',
        description: '',
        list_dates: [],
        time: '',
        completed: false,
        createdAt: new Date()
      });
      setSelectAllYear(false);
      setSelectPeriod(false);
      setPeriodStart(null);
      setPeriodEnd(null);
      onCloseAddTask();
    }
  };

  const handleDateChange = (dates) => {
    setNewTask(prev => ({
      ...prev,
      list_dates: dates
    }));
  };

  // Selecionar todos os dias do ano
  const handleSelectAllYear = (checked) => {
    setSelectAllYear(checked);
    setSelectPeriod(false);
    setPeriodStart(null);
    setPeriodEnd(null);
    if (checked) {
      const today = new Date();
      const year = today.getFullYear();
      const start = new Date(today);
      const end = new Date(year, 11, 31);
      const dates = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }
      setNewTask(prev => ({ ...prev, list_dates: dates }));
    } else {
      setNewTask(prev => ({ ...prev, list_dates: [] }));
    }
  };

  // Selecionar período
  const handleSelectPeriod = (checked) => {
    setSelectPeriod(checked);
    setSelectAllYear(false);
    if (!checked) {
      setPeriodStart(null);
      setPeriodEnd(null);
      setNewTask(prev => ({ ...prev, list_dates: [] }));
    }
  };

  const handlePeriodChange = (type, value) => {
    // Função auxiliar para criar data local sem horário
    const toLocalDate = (dateString) => {
      if (!dateString) return null;
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    };
    if (type === 'start') {
      setPeriodStart(value);
      if (periodEnd && value && toLocalDate(value) <= toLocalDate(periodEnd)) {
        const start = toLocalDate(value);
        const end = toLocalDate(periodEnd);
        const dates = [];
        let d = new Date(start);
        while (d <= end) {
          dates.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        setNewTask(prev => ({ ...prev, list_dates: dates }));
      } else {
        setNewTask(prev => ({ ...prev, list_dates: [] }));
      }
    } else {
      setPeriodEnd(value);
      if (periodStart && value && toLocalDate(periodStart) <= toLocalDate(value)) {
        const start = toLocalDate(periodStart);
        const end = toLocalDate(value);
        const dates = [];
        let d = new Date(start);
        while (d <= end) {
          dates.push(new Date(d));
          d.setDate(d.getDate() + 1);
        }
        setNewTask(prev => ({ ...prev, list_dates: dates }));
      } else {
        setNewTask(prev => ({ ...prev, list_dates: [] }));
      }
    }
  };

  if (!showAddTask) return null;

  return (
    <div className="modal-overlay" onClick={onCloseAddTask}>
      <div className="modal-content add-task-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Tarefa</h2>
          <button className="close-button" onClick={onCloseAddTask}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="title">Título *</label>
            <input 
              id="title"
              type="text" 
              placeholder="Digite o título da tarefa"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição *</label>
            <textarea 
              id="description"
              placeholder="Digite a descrição da tarefa"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Selecione as Datas *</label>
            <div style={{ display: 'flex', gap: '18px', marginBottom: '10px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectAllYear}
                  onChange={e => handleSelectAllYear(e.target.checked)}
                />
                Todos os dias do ano
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectPeriod}
                  onChange={e => handleSelectPeriod(e.target.checked)}
                />
                Selecionar período
              </label>
            </div>
            {selectPeriod && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input
                  type="date"
                  value={periodStart}
                  onChange={e => handlePeriodChange('start', e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #333', background: '#232526', color: '#fff' }}
                />
                até
                <input
                  type="date"
                  value={periodEnd}
                  onChange={e => handlePeriodChange('end', e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #333', background: '#232526', color: '#fff' }}
                />
              </div>
            )}
            <div className="calendar-container">
              <DatePicker
                selected={newTask.list_dates[0]}
                onChange={handleDateChange}
                selectsMultiple
                inline
                minDate={new Date()}
                locale="pt-BR"
                dateFormat="dd/MM/yyyy"
                className="date-picker-input"
                calendarClassName="custom-calendar"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                selectedDates={newTask.list_dates}
                highlightDates={newTask.list_dates}
                disabled={selectAllYear || selectPeriod}
              />
            </div>
          </div>

          {newTask.list_dates.length > 0 && (
            <div className="form-group">
              <label>Datas Selecionadas ({newTask.list_dates.length})</label>
              <div className="selected-dates">
                {newTask.list_dates.map((date, index) => (
                  <div key={index} className="date-tag">
                    {date.toLocaleDateString('pt-BR')}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="time">Horário</label>
            <input
              id="time"
              type="time"
              value={newTask.time}
              onChange={(e) => setNewTask(prev => ({
                ...prev,
                time: e.target.value
              }))}
            />
          </div>

          <button 
            className="confirm-button"
            onClick={handleAddTask}
            disabled={!newTask.title.trim() || !newTask.description.trim() || newTask.list_dates.length === 0}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
} 