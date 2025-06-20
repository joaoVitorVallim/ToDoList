import { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import Header from "../components/header";
import Calendar from "../components/Calendar.jsx";
import TaskModal from "../components/TaskModal.jsx";
import TasksList from "../components/TasksList";
import "./css/tarefas.css";

const URL_BASE = import.meta.env.VITE_URL_BASE;

export default function Tarefas() {
  // Estados para controlar a interface
  const [tasks, setTasks] = useState([]); // Lista de todas as tarefas do usuário
  const [showAddTask, setShowAddTask] = useState(false); // Controla exibição do modal de adicionar tarefa
  const [showTasksList, setShowTasksList] = useState(false); // Controla exibição da lista de tarefas
  const [selectedDate, setSelectedDate] = useState(null); // Data selecionada no calendário
  const [showEditModal, setShowEditModal] = useState(false); // Controla exibição do modal de edição
  const [editingTask, setEditingTask] = useState(null); // Tarefa sendo editada
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controla exibição do modal de exclusão
  const [taskToDelete, setTaskToDelete] = useState(null); // Tarefa a ser excluída
  const [deleteFromAllDays, setDeleteFromAllDays] = useState(false); // Opção de exclusão (dia específico ou todos os dias)

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
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setTasks([]); // Garante que tasks sempre será um array
    }
  }, []);

  // Busca tarefas quando o componente é montado
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Callback executado quando uma nova tarefa é criada
   * @param {Object} newTask - Nova tarefa criada
   */
  const handleTaskCreated = (newTask) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    fetchTasks(); // Re-busca as tarefas para garantir consistência
  };

  /**
   * Callback executado quando uma data é selecionada no calendário
   * @param {Date} date - Data selecionada
   */
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowTasksList(true); // Abre a lista de tarefas do dia
  };

  /**
   * Marca/desmarca uma tarefa como concluída
   * @param {string} taskId - ID da tarefa
   * @param {Date} date - Data da tarefa
   */
  const handleToggleTask = async (taskId, date) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token não encontrado.");

      // A 'date' recebida é um objeto Date, então podemos usá-la diretamente
      if (!(date instanceof Date)) {
        throw new Error("O formato da data é inválido.");
      }

      // Envia requisição para marcar como concluída, usando a data no formato ISO
      await axios.post(
         `${URL_BASE}/tasks/checked/${taskId}`,
        { 
          datesToMove: [date.toISOString()]
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Atualiza o estado local para refletir a mudança imediatamente
      setTasks(prevTasks => {
        const dateString = date.toISOString().split('T')[0];

        return prevTasks.map(task => {
          if (task._id === taskId) {
            // Remove a data de 'list_dates'
            const updatedListDates = task.list_dates.filter(d => {
              const taskDateString = (d.date || d).toString().split('T')[0];
              return taskDateString !== dateString;
            });

            // Adiciona a data a 'completed' (se ainda não estiver lá)
            const updatedCompleted = [...(task.completed || [])];
            if (!updatedCompleted.some(d => (d.date || d).toString().split('T')[0] === dateString)) {
              updatedCompleted.push(date); // Adiciona como objeto Date
            }

            return { 
              ...task, 
              list_dates: updatedListDates,
              completed: updatedCompleted
            };
          }
          return task;
        });
      });

    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error.response ? error.response.data : error.message);
    }
  };

  /**
   * Abre o modal de edição de tarefa
   * @param {Object} task - Tarefa a ser editada
   */
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  /**
   * Atualiza uma tarefa existente
   * @param {Object} updatedTask - Dados atualizados da tarefa
   */
  const handleUpdateTask = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task._id === updatedTask._id
          ? { ...task, ...updatedTask }
          : task
      )
    );
    setShowEditModal(false);
    setEditingTask(null);
    fetchTasks(); // Opcional, para garantir consistência
  };

  /**
   * Abre o modal de confirmação de exclusão
   * @param {Object} task - Tarefa a ser excluída
   */
  const handleDeleteTask = async (task) => {
    setTaskToDelete(task);
    setDeleteFromAllDays(false); // Reset para a opção padrão (apenas do dia)
    setShowDeleteModal(true);
  };

  /**
   * Confirma a exclusão da tarefa baseado na opção selecionada
   */
  const confirmDeleteTask = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Token não encontrado.");

      if (deleteFromAllDays) {
        // Excluir a tarefa completamente
        await axios.delete(
           `${URL_BASE}/tasks/${taskToDelete._id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        // Atualizar o estado local removendo a tarefa completamente
        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskToDelete._id));
      } else {
        // Remover apenas a data selecionada da tarefa
        const dateString = selectedDate.toISOString().split('T')[0];
        
        // Encontrar a tarefa e remover apenas a data selecionada
        const updatedTasks = tasks.map(task => {
          if (task._id === taskToDelete._id) {
            // Remove a data de list_dates
            const updatedListDates = task.list_dates.filter(d => {
              if (typeof d === 'string') {
                return !d.startsWith(dateString);
              } else if (typeof d === 'object' && d.date) {
                return !d.date.startsWith(dateString);
              } else if (d instanceof Date) {
                return d.toISOString().split('T')[0] !== dateString;
              }
              return true;
            });

            // Remove a data de completed também
            const updatedCompleted = task.completed ? task.completed.filter(d => {
              if (typeof d === 'string') {
                return !d.startsWith(dateString);
              } else if (typeof d === 'object' && d.date) {
                return !d.date.startsWith(dateString);
              } else if (d instanceof Date) {
                return d.toISOString().split('T')[0] !== dateString;
              }
              return true;
            }) : [];

            return {
              ...task,
              list_dates: updatedListDates,
              completed: updatedCompleted
            };
          }
          return task;
        });

        // Verifica se a tarefa ficou sem datas
        const tarefaAtualizada = updatedTasks.find(t => t._id === taskToDelete._id);
        if (
          tarefaAtualizada.list_dates.length === 0 &&
          (!tarefaAtualizada.completed || tarefaAtualizada.completed.length === 0)
        ) {
          // Exclui a tarefa do backend e do estado local
          await axios.delete(
             `${URL_BASE}/tasks/${taskToDelete._id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setTasks(updatedTasks.filter(t => t._id !== taskToDelete._id));
        } else {
          // Atualiza a tarefa no backend com as novas datas
          await axios.put(
            `${URL_BASE}/tasks/${taskToDelete._id}`,
            {
              list_dates: tarefaAtualizada.list_dates,
              completed: tarefaAtualizada.completed
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          setTasks(updatedTasks);
        }
      }
      
      // Fechar os modais
      setShowDeleteModal(false);
      setShowTasksList(false);
      setTaskToDelete(null);
      setDeleteFromAllDays(false);
      
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error.response ? error.response.data : error.message);
    }
  };

  /**
   * Calcula quantas tarefas incompletas existem para uma data específica
   * Usado para mostrar indicadores no calendário
   * @param {Date} date - Data para verificar
   * @returns {number} Número de tarefas incompletas
   */
  const getIncompleteTasksForDate = (date) => {
    if (!date) return 0;
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => 
      task.list_dates.some(d => {
        if (typeof d === 'string') {
          return d.startsWith(dateString);
        } else if (d instanceof Date) {
          return d.toISOString().split('T')[0] === dateString;
        } else if (d && d.date) {
          return d.date.startsWith(dateString);
        }
        return false;
      })
    ).length;
  };

  return (
    <div>
      <Header />
      <h1 className="titulo">Minhas Tarefas</h1>

      <div className="tasks-container">
        {/* Cabeçalho com calendário e botão de adicionar */}
        <div className="calendar-header">
          <Calendar 
            tasks={tasks}
            onDateSelect={handleDateSelect}
            getIncompleteTasksForDate={getIncompleteTasksForDate}
          />
          <button 
            className="add-task-button"
            type="button"
            onClick={() => setShowAddTask(true)}
          >
            + Nova Tarefa
          </button>
        </div>

        {/* Modal de adicionar tarefa */}
        <TaskModal
          showModal={showAddTask}
          onCloseModal={() => setShowAddTask(false)}
          onTaskCreated={handleTaskCreated}
          buttonText="Adicionar"
        />

        {/* Lista de tarefas do dia selecionado */}
        <TasksList
          isOpen={showTasksList}
          onClose={() => setShowTasksList(false)}
          selectedDate={selectedDate}
          tasks={tasks.filter(task => {
            if (!selectedDate) return false;
            const dateString = selectedDate.toISOString().split('T')[0];
            
            // Verifica se a data está em list_dates (tarefa pendente)
            const isInListDates = task.list_dates.some(d => {
              if (typeof d === 'string') {
                return d.startsWith(dateString);
              } else if (d instanceof Date) {
                return d.toISOString().split('T')[0] === dateString;
              } else if (d && d.date) {
                return d.date.startsWith(dateString);
              }
              return false;
            });
            
            // Verifica se a data está em completed (tarefa concluída)
            const isCompleted = task.completed && task.completed.some(d => {
              if (typeof d === 'string') {
                return d.startsWith(dateString);
              } else if (d instanceof Date) {
                return d.toISOString().split('T')[0] === dateString;
              } else if (d && d.date) {
                return d.date.startsWith(dateString);
              }
              return false;
            });
            
            // Retorna true se a tarefa está em list_dates OU completed para esta data
            return isInListDates || isCompleted;
          })}
          onToggleTask={handleToggleTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />

        {/* Modal de edição de tarefa */}
        <TaskModal
          showModal={showEditModal}
          onCloseModal={() => setShowEditModal(false)}
          onTaskUpdated={handleUpdateTask}
          editingTask={editingTask}
          buttonText="Salvar"
        />

        {/* Modal de confirmação de exclusão */}
        {showDeleteModal && taskToDelete && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content add-task-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Excluir Tarefa</h2>
                <button className="close-button" onClick={() => setShowDeleteModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Tem certeza que deseja excluir a tarefa <b>"{taskToDelete.title}"</b>?</p>
                
                {/* Opções de exclusão */}
                <div style={{margin: '18px 0'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: '12px'}}>
                    <input
                      type="radio"
                      name="deleteOption"
                      checked={!deleteFromAllDays}
                      onChange={() => setDeleteFromAllDays(false)}
                      style={{margin: 0}}
                    />
                    <span>Excluir apenas do dia {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}</span>
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <input
                      type="radio"
                      name="deleteOption"
                      checked={deleteFromAllDays}
                      onChange={() => setDeleteFromAllDays(true)}
                      style={{margin: 0}}
                    />
                    <span>Excluir de todos os dias (tarefa completa)</span>
                  </label>
                </div>
                
                {/* Aviso de ação irreversível */}
                <p style={{color: '#ff9800', fontSize: '14px', marginTop: '10px'}}>
                  ⚠️ Esta ação não pode ser desfeita.
                </p>
                
                {/* Botões de ação */}
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24}}>
                  <button 
                    className="confirm-button" 
                    style={{background: '#888'}} 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="confirm-button" 
                    style={{background: '#d32f2f'}} 
                    onClick={confirmDeleteTask}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
