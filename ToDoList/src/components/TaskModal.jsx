import './css/taskModal.css';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function TaskModal({ showModal, onCloseModal, buttonText = 'Adicionar' }) {
  if (!showModal) return null;

  // Define o título do modal conforme o texto do botão
  const titulo = buttonText === 'Salvar' ? 'Editar Tarefa' : 'Nova Tarefa';

  return (
    <div className="modal-overlay" onClick={onCloseModal}>
      <div className="modal-content add-task-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="close-button" onClick={onCloseModal}>×</button>
        </div>
        <div className="modal-body">
          <form>
            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                id="title"
                type="text"
                placeholder="Digite o título da tarefa"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descrição *</label>
              <textarea
                id="description"
                placeholder="Digite a descrição da tarefa"
              />
            </div>
            <div className="form-group">
              <label>Selecione as Datas *</label>
              <div className="calendar-container">
                <DatePicker
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
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="time">Horário *</label>
              <input
                id="time"
                type="time"
              />
            </div>
            <button
              className="confirm-button"
              type="button"
            >
              {buttonText}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 