import React, { useState, useEffect } from 'react';
import './App.css';
import Calendar from './components/Calendar';
import TaskModal from './components/TaskModal';
import TasksList from './components/TasksList';

function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isTasksListModalOpen, setIsTasksListModalOpen] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (newTask) => {
    const task = {
      id: Date.now(),
      ...newTask,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, task]);
  };

  const handleToggleTask = (taskId) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { 
          ...task, 
          completed: !task.completed,
          lastCompleted: !task.completed ? new Date().toISOString() : null
        } : task
      )
    );
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.list_dates.some(taskDate => 
        new Date(taskDate).toISOString().split('T')[0] === date
      )
    );
  };

  const getPendingTasksCount = (date) => {
    return getTasksForDate(date).filter(task => !task.completed).length;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsTasksListModalOpen(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Lista de Tarefas</h1>
        <button 
          className="new-task-button"
          onClick={() => setIsAddTaskModalOpen(true)}
        >
          Nova Tarefa
        </button>
      </header>

      <main className="app-main">
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          getPendingTasksCount={getPendingTasksCount}
        />
      </main>

      <TaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <TasksList
        isOpen={isTasksListModalOpen}
        onClose={() => setIsTasksListModalOpen(false)}
        selectedDate={selectedDate}
        tasks={getTasksForDate(selectedDate)}
        onToggleTask={handleToggleTask}
      />
    </div>
  );
}

export default App; 