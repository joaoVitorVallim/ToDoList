import './css/taskModal.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { registerLocale } from "react-datepicker";
import ptBR from 'date-fns/locale/pt-BR';

registerLocale('pt-BR', ptBR);

/**
 * Componente modal para adicionar ou editar tarefas
 * @param {boolean} showModal - Controla se o modal está visível
 * @param {Function} onCloseModal - Função para fechar o modal
 * @param {Function} onTaskCreated - Callback executado quando uma nova tarefa é criada
 * @param {Function} onTaskUpdated - Callback executado quando uma tarefa é atualizada
 * @param {Object} editingTask - Tarefa sendo editada (null se for criação)
 * @param {string} buttonText - Texto do botão principal
 */
const TaskModal = ({ 
  showModal, 
  onCloseModal, 
  onTaskCreated, 
  onTaskUpdated, 
  editingTask, 
  buttonText = "Adicionar" 
}) => {
  // Estados do formulário
  const [title, setTitle] = useState(''); // Título da tarefa
  const [description, setDescription] = useState(''); // Descrição da tarefa
  const [time, setTime] = useState(''); // Horário da tarefa (formato HH:MM)
  const [selectedDates, setSelectedDates] = useState([]); // Datas selecionadas
  const [error, setError] = useState(''); // Mensagem de erro
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado de submissão
  const [dateRange, setDateRange] = useState([null, null]);
  const [isMonthSelected, setIsMonthSelected] = useState(false);
  const [isYearSelected, setIsYearSelected] = useState(false);

  const [startDate, endDate] = dateRange;

  /**
   * Preenche o formulário com os dados da tarefa quando está editando
   * Executado quando editingTask muda ou quando o modal é aberto
   */
  useEffect(() => {
    if (editingTask) {
      // Preenche os campos com os dados da tarefa existente
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setTime(editingTask.time || '');
      
      // Converte as datas da tarefa para objetos Date
      const dates = [];
      if (editingTask.list_dates) {
        editingTask.list_dates.forEach(date => {
          if (typeof date === 'string') {
            dates.push(new Date(date));
          } else if (date instanceof Date) {
            dates.push(date);
          } else if (date && date.date) {
            dates.push(new Date(date.date));
          }
        });
      }
      setSelectedDates(dates);
    } else {
      // Limpa o formulário para nova tarefa
      setTitle('');
      setDescription('');
      setTime('');
      setSelectedDates([]);
    }
    setError(''); // Limpa erros anteriores
  }, [editingTask, showModal]);

  /**
   * Adiciona ou remove uma data da lista ao ser clicada no calendário
   */
  const handleDateChange = (date) => {
    if (!date) return;

    const dateIsSelected = selectedDates.some(
      (selectedDate) => selectedDate.toDateString() === date.toDateString()
    );

    if (dateIsSelected) {
      removeDate(date);
    } else {
      setSelectedDates(prev => [...prev, date].sort((a, b) => a - b));
    }
  };

  /**
   * Remove uma data da lista de datas selecionadas
   */
  const removeDate = (dateToRemove) => {
    setSelectedDates(prev => prev.filter(date => date.toDateString() !== dateToRemove.toDateString()));
  };

  /**
   * Adiciona um array de datas ao estado, garantindo que não haja duplicatas.
   */
  const addDatesWithoutDuplicates = (datesToAdd) => {
    const allDates = [...selectedDates, ...datesToAdd];
    const uniqueDatesMap = new Map();

    allDates.forEach(date => {
      uniqueDatesMap.set(date.toDateString(), date);
    });

    const uniqueDates = Array.from(uniqueDatesMap.values());
    setSelectedDates(uniqueDates.sort((a, b) => a - b));
  };
  
  const getRemainingDatesInMonth = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const dates = [];
    for (let day = today.getDate(); day <= lastDayOfMonth; day++) {
      dates.push(new Date(year, month, day));
    }
    return dates;
  };

  const getRemainingDatesInYear = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = today.getFullYear();
    const dates = [];
    let currentDate = new Date(today);
    while (currentDate.getFullYear() === year) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };
  
  const handleMonthCheckboxChange = (e) => {
    const datesForMonth = getRemainingDatesInMonth();
    if (e.target.checked) {
      addDatesWithoutDuplicates(datesForMonth);
    } else {
      const monthDateStrings = new Set(datesForMonth.map(d => d.toDateString()));
      setSelectedDates(prev => prev.filter(d => !monthDateStrings.has(d.toDateString())));
    }
  };

  const handleYearCheckboxChange = (e) => {
    const datesForYear = getRemainingDatesInYear();
    if (e.target.checked) {
      addDatesWithoutDuplicates(datesForYear);
    } else {
      const yearDateStrings = new Set(datesForYear.map(d => d.toDateString()));
      setSelectedDates(prev => prev.filter(d => !yearDateStrings.has(d.toDateString())));
    }
  };

  useEffect(() => {
    const datesForMonth = getRemainingDatesInMonth();
    if (datesForMonth.length > 0) {
      const allMonthDatesSelected = datesForMonth.every(d1 => 
        selectedDates.some(d2 => d1.toDateString() === d2.toDateString())
      );
      setIsMonthSelected(allMonthDatesSelected);
    } else {
      setIsMonthSelected(false);
    }

    const datesForYear = getRemainingDatesInYear();
    if (datesForYear.length > 0) {
      const allYearDatesSelected = datesForYear.every(d1 => 
        selectedDates.some(d2 => d1.toDateString() === d2.toDateString())
      );
      setIsYearSelected(allYearDatesSelected);
    } else {
      setIsYearSelected(false);
    }
  }, [selectedDates]);

  const selectDateRange = () => {
    if (!startDate || !endDate || startDate > endDate) {
      setError("Selecione um período válido.");
      return;
    }
    setError("");
    const dates = [];
    let currentDate = new Date(startDate);

    while(currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    addDatesWithoutDuplicates(dates);
    setDateRange([null, null]); // Reseta o período após adicionar
  };

  /**
   * Valida os dados do formulário antes de enviar
   * @returns {boolean} True se os dados são válidos
   */
  const validateForm = () => {
    if (!title.trim()) {
      setError('O título é obrigatório');
      return false;
    }
    if (selectedDates.length === 0) {
      setError('Selecione pelo menos uma data');
      return false;
    }
    if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      setError('Formato de horário inválido (use HH:MM)');
      return false;
    }
    return true;
  };

  /**
   * Envia o formulário para criar ou atualizar uma tarefa
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Prepara os dados da tarefa
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        time: time || null,
        list_dates: selectedDates.map(date => date.toISOString())
      };

      let response;
      
      if (editingTask) {
        // Atualiza tarefa existente
        response = await axios.put(
          `http://localhost:3000/tasks/${editingTask._id}`,
          taskData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (onTaskUpdated) {
          onTaskUpdated(response.data);
        }
      } else {
        // Cria nova tarefa
        response = await axios.post(
          'http://localhost:3000/tasks',
          taskData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (onTaskCreated) {
          onTaskCreated(response.data);
        }
      }

      // Fecha o modal após sucesso
      onCloseModal();
      
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao salvar tarefa. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Não renderiza nada se o modal não estiver visível
  if (!showModal) return null;

  // Define o título do modal conforme o texto do botão
  const titulo = buttonText === 'Salvar' ? 'Editar Tarefa' : 'Nova Tarefa';

  return (
    <div className="modal-overlay" onClick={onCloseModal}>
      <div className="modal-content add-task-modal" onClick={e => e.stopPropagation()}>
        {/* Cabeçalho do modal */}
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="close-button" onClick={onCloseModal}>&times;</button>
        </div>
        
        {/* Corpo do modal com formulário */}
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Campo de título */}
            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título da tarefa"
                required
              />
            </div>

            {/* Campo de descrição */}
            <div className="form-group">
              <label htmlFor="description">Descrição *</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Digite a descrição da tarefa"
                required
              />
            </div>

            {/* Campo de horário */}
            <div className="form-group">
              <label htmlFor="time">Horário (opcional)</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="HH:MM"
              />
            </div>

            {/* Seção de seleção de datas */}
            <div className="form-group">
              <label>Selecionar Datas</label>
              <div className="date-selection-container">
                <DatePicker
                  selected={null}
                  onChange={handleDateChange}
                  inline
                  locale="pt-BR"
                  minDate={new Date()}
                  highlightDates={selectedDates}
                />
                <div className="date-selection-actions">
                  <div className="date-presets">
                    <div className="checkbox-preset">
                      <input
                        type="checkbox"
                        id="month-checkbox"
                        checked={isMonthSelected}
                        onChange={handleMonthCheckboxChange}
                      />
                      <label htmlFor="month-checkbox">Mês Inteiro</label>
                    </div>
                    <div className="checkbox-preset">
                      <input
                        type="checkbox"
                        id="year-checkbox"
                        checked={isYearSelected}
                        onChange={handleYearCheckboxChange}
                      />
                      <label htmlFor="year-checkbox">Ano Inteiro</label>
                    </div>
                  </div>
                  <div className="date-range-selector">
                    <p>Selecione um período específico:</p>
                    <DatePicker
                      selectsRange={true}
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update);
                      }}
                      minDate={new Date()}
                      placeholderText="Clique para selecionar o período"
                      className="date-range-input"
                      locale="pt-BR"
                      isClearable={true}
                      dateFormat="dd/MM/yyyy"
                    />
                    <button type="button" onClick={selectDateRange}>Adicionar Período</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de datas selecionadas */}
            {selectedDates.length > 0 && (
              <div className="form-group">
                <div className="selected-dates-header">
                  <label>Datas selecionadas ({selectedDates.length})</label>
                  <button 
                    type="button" 
                    onClick={() => setSelectedDates([])} 
                    className="clear-all-button"
                  >
                    Limpar tudo
                  </button>
                </div>
                <div className="selected-dates-list">
                  {selectedDates.sort((a,b) => a - b).map((date, index) => (
                    <div key={index} className="date-tag">
                      <span>{date.toLocaleDateString('pt-BR')}</span>
                      <button
                        type="button"
                        onClick={() => removeDate(date)}
                        className="remove-date"
                        title="Remover data"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Botão de submissão */}
            <button
              type="submit"
              className="confirm-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : buttonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TaskModal; 