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

  // Função para adicionar uma nova tarefa
  const addTask = (task) => {
    setTasks(prevTasks => [...prevTasks, task]);
    setShowAddTask(false);
  };

  // Função para marcar uma tarefa como concluída
  const toggleTask = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              lastCompleted: !task.completed ? new Date() : null
            }
          : task
      )
    );
  };

  // Função para obter tarefas não concluídas de um dia específico
  const getIncompleteTasks = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => 
      task.list_dates.some(taskDate => 
        taskDate.toISOString().split('T')[0] === dateStr
      ) && !task.completed
    ).length;
  };

  // Função para obter tarefas de um dia específico
  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task =>
      task.list_dates.some(taskDate =>
        taskDate.toISOString().split('T')[0] === dateStr
      )
    );
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
