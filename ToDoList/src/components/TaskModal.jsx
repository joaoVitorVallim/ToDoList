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
   * Adiciona uma nova data à lista de datas selecionadas
   * @param {Date} date - Data a ser adicionada
   */
  const handleDateChange = (date) => {
    if (date && !selectedDates.some(d => d.toDateString() === date.toDateString())) {
      setSelectedDates(prev => [...prev, date]);
    }
  };

  /**
   * Remove uma data da lista de datas selecionadas
   * @param {Date} dateToRemove - Data a ser removida
   */
  const removeDate = (dateToRemove) => {
    setSelectedDates(prev => prev.filter(date => date.toDateString() !== dateToRemove.toDateString()));
  };

  /**
   * Seleciona todas as datas do mês atual
   */
  const selectAllDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const allDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      allDates.push(new Date(year, month, day));
    }
    
    setSelectedDates(allDates);
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
              <label>Datas *</label>
              
              {/* Botão para selecionar todas as datas do mês */}
              <button
                type="button"
                onClick={selectAllDates}
                className="select-all-dates-button"
                style={{ marginBottom: '10px' }}
              >
                Selecionar todas as datas do mês
              </button>
              
              {/* Calendário para seleção de datas */}
              <div className="calendar-container">
                <DatePicker
                  selected={null}
                  onChange={handleDateChange}
                  inline
                  locale="pt-BR"
                  dateFormat="dd/MM/yyyy"
                  highlightDates={selectedDates}
                  placeholderText="Selecione as datas"
                />
              </div>
              
              {/* Lista de datas selecionadas */}
              {selectedDates.length > 0 && (
                <div className="selected-dates">
                  <label>Datas selecionadas:</label>
                  <div className="selected-dates-list">
                    {selectedDates.map((date, index) => (
                      <div key={index} className="date-tag">
                        <span>{date.toLocaleDateString('pt-BR')}</span>
                        <button
                          type="button"
                          onClick={() => removeDate(date)}
                          className="remove-date"
                          title="Remover data"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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