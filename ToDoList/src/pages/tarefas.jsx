import { useState, useEffect } from "react";
import Header from "../components/header";
import Calendar from "../components/Calendar.jsx";
import TaskModal from "../components/TaskModal.jsx";
import TasksList from "../components/TasksList";
import "./css/tarefas.css";

export default function Tarefas() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showTasksList, setShowTasksList] = useState(false);

  // Função para verificar e marcar tarefas falhadas
  const checkFailedTasks = () => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    setTasks(prevTasks => 
      prevTasks.map(task => {
        // Verificar se a tarefa tem datas passadas não concluídas
        const hasFailedDates = task.dates.some(dateEntry => {
          const taskDateStart = new Date(dateEntry.date.getFullYear(), dateEntry.date.getMonth(), dateEntry.date.getDate());
          return taskDateStart < todayStart && !dateEntry.completed;
        });
        
        return {
          ...task,
          failed: hasFailedDates
        };
      })
    );
  };

  // Executar verificação de tarefas falhadas ao carregar e a cada minuto
  useEffect(() => {
    checkFailedTasks();
    
    const interval = setInterval(checkFailedTasks, 60000); // Verificar a cada minuto
    
    return () => clearInterval(interval);
  }, []);

  // Função para adicionar uma nova tarefa
  const addTask = (task) => {
    // Converter list_dates para o novo formato com status individual por data
    const datesWithStatus = task.list_dates.map(date => ({
      date: date,
      completed: false,
      completedAt: null
    }));

    const newTask = {
      ...task,
      id: Date.now() + Math.random(),
      dates: datesWithStatus,
      failed: false
    };
    
    // Remover list_dates antigo
    delete newTask.list_dates;
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    setShowAddTask(false);
  };

  // Função para marcar uma tarefa como concluída em uma data específica
  const toggleTask = (taskId, targetDate) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedDates = task.dates.map(dateEntry => {
            const dateEntryStart = new Date(dateEntry.date.getFullYear(), dateEntry.date.getMonth(), dateEntry.date.getDate());
            const targetDateStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
            
            if (dateEntryStart.getTime() === targetDateStart.getTime()) {
              return {
                ...dateEntry,
                completed: !dateEntry.completed,
                completedAt: !dateEntry.completed ? new Date() : null
              };
            }
            return dateEntry;
          });
          
          return {
            ...task,
            dates: updatedDates,
            failed: false // Resetar falha quando marcar como concluída
          };
        }
        return task;
      })
    );
  };

  // Função para obter tarefas não concluídas de um dia específico
  const getIncompleteTasks = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => 
      task.dates.some(dateEntry => 
        dateEntry.date.toISOString().split('T')[0] === dateStr && !dateEntry.completed
      )
    ).length;
  };

  // Função para obter tarefas de um dia específico
  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    
    return tasks.filter(task =>
      task.dates.some(dateEntry =>
        dateEntry.date.toISOString().split('T')[0] === dateStr
      )
    ).map(task => {
      // Encontrar o status específico para esta data
      const dateEntry = task.dates.find(dateEntry => 
        dateEntry.date.toISOString().split('T')[0] === dateStr
      );
      
      return {
        ...task,
        completed: dateEntry ? dateEntry.completed : false,
        completedAt: dateEntry ? dateEntry.completedAt : null,
        targetDate: date // Data específica para esta visualização
      };
    });
  };

  // Função para abrir o modal de tarefas do dia
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowTasksList(true);
  };

  return (
    <div>
      <Header />
      <h1 className="titulo">Minhas Tarefas</h1>

      <div className="tasks-container">
        <div className="calendar-header">
          <Calendar 
            tasks={tasks}
            onDateSelect={handleDateSelect}
            getIncompleteTasks={getIncompleteTasks}
          />
          <button 
            className="add-task-button"
            onClick={() => setShowAddTask(true)}
          >
            + Nova Tarefa
          </button>
        </div>

        {showAddTask && (
          <TaskModal
            date={selectedDate}
            tasks={getTasksForDate(selectedDate)}
            onClose={() => setSelectedDate(null)}
            onToggleTask={toggleTask}
            showAddTask={showAddTask}
            onAddTask={addTask}
            onCloseAddTask={() => setShowAddTask(false)}
          />
        )}

        {showTasksList && (
          <TasksList
            isOpen={showTasksList}
            onClose={() => setShowTasksList(false)}
            selectedDate={selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}
            tasks={getTasksForDate(selectedDate)}
            onToggleTask={toggleTask}
          />
        )}
      </div>
    </div>
  );
}
