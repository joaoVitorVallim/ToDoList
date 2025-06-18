import { useState, useEffect } from 'react';
import './css/calendar.css';

export default function Calendar({ tasks, onDateSelect, getIncompleteTasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    const today = new Date();
    
    // Preencher os dias vazios do início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Preencher os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const isPast = currentDay < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = currentDay.toDateString() === today.toDateString();
      
      const dateKey = currentDay.toDateString();
      const dayTasks = tasks[dateKey] || [];
      const incompleteTasks = dayTasks.filter(task => !task.completed).length;
      const completedTasks = dayTasks.filter(task => task.completed).length;
      
      days.push({
        date: currentDay,
        isPast,
        isToday,
        incompleteTasks,
        completedTasks
      });
    }
    
    return days;
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const handleDayClick = (day) => {
    if (day && onDateSelect) {
      onDateSelect(day.date);
    }
  };

  // Funções para navegar entre meses
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const prevMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      return prevMonth;
    });
  };
  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const nextMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      return nextMonth;
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header calendar-header-flex">
        <button onClick={handlePrevMonth} className="calendar-nav-btn" aria-label="Mês anterior">&#8592;</button>
        <h2 style={{ margin: 0 }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
        <button onClick={handleNextMonth} className="calendar-nav-btn" aria-label="Próximo mês">&#8594;</button>
      </div>
      
      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
        
        {getDaysInMonth(currentDate).map((day, index) => (
          <div 
            key={index} 
            className={`calendar-day ${day ? (day.isPast ? 'past' : '') : 'empty'} ${day?.isToday ? 'today' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            {day && (
              <>
                <span className="day-number">{day.date.getDate()}</span>
                <div className="task-counts">
                  {day.incompleteTasks > 0 && (
                    <div className="task-count incomplete">
                      {day.incompleteTasks} pendente{day.incompleteTasks !== 1 ? 's' : ''}
                    </div>
                  )}
                  {day.completedTasks > 0 && (
                    <div className="task-count complete">
                      {day.completedTasks} concluída{day.completedTasks !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 