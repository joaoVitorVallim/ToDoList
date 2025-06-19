import { useState } from "react";
import Header from "../components/header";
import Calendar from "../components/Calendar.jsx";
import TaskModal from "../components/TaskModal.jsx";
import TasksList from "../components/TasksList";
import "./css/tarefas.css";

export default function Tarefas() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTasksList, setShowTasksList] = useState(false);

  return (
    <div>
      <Header />
      <h1 className="titulo">Minhas Tarefas</h1>

      <div className="tasks-container">
        <div className="calendar-header">
          <Calendar 
            tasks={[]}
            onDateSelect={() => setShowTasksList(true)}
            getIncompleteTasks={() => 0}
          />
          <button 
            className="add-task-button"
            type="button"
            onClick={() => setShowAddTask(true)}
          >
            + Nova Tarefa
          </button>
        </div>

        {/* Modal de adicionar tarefa (apenas visual) */}
        <TaskModal
          showModal={showAddTask}
          onCloseModal={() => setShowAddTask(false)}
          buttonText="Adicionar"
        />

        {/* Lista de tarefas do dia (apenas visual) */}
        <TasksList
          isOpen={showTasksList}
          onClose={() => setShowTasksList(false)}
          selectedDate={""}
          tasks={[]}
          onToggleTask={() => {}}
          onEditTask={() => {}}
          onDeleteTask={() => {}}
        />

        {/* Modal de edição de tarefa (apenas visual) */}
        <TaskModal
          showModal={false}
          onCloseModal={() => {}}
          buttonText="Salvar"
        />

        {/* Modal de confirmação de deleção (apenas visual) */}
        {false && (
          <div className="modal-overlay">
            <div className="modal-content add-task-modal">
              <div className="modal-header">
                <h2>Excluir Tarefa</h2>
                <button className="close-button">&times;</button>
              </div>
              <div className="modal-body">
                <p>Deseja excluir a tarefa <b>Título da tarefa</b>?</p>
                <div style={{margin: '18px 0'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <input
                      type="checkbox"
                      checked={false}
                      readOnly
                    />
                    Excluir de todos os dias
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8}}>
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                    />
                    Excluir apenas do dia selecionado
                  </label>
                </div>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12}}>
                  <button className="confirm-button" style={{background: '#888'}}>Cancelar</button>
                  <button className="confirm-button" style={{background: '#d32f2f'}}>Excluir</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
