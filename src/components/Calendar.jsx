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
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Preencher os dias vazios do início do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Preencher os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const currentDayStart = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());
      const isPastDay = currentDayStart < todayStart;
      const isToday = currentDayStart.getTime() === todayStart.getTime();
      
      const dateKey = currentDay.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => {
        // Verifica se a tarefa está em list_dates (pendente)
        const isInListDates = task.list_dates.some(d => 
          (typeof d === 'string' && d.startsWith(dateKey)) ||
          (typeof d === 'object' && d.date && d.date.startsWith(dateKey)) ||
          (d instanceof Date && d.toISOString().split('T')[0] === dateKey)
        );
        
        // Verifica se a tarefa está em completed (concluída)
        const isCompleted = task.completed && task.completed.some(d => 
          (typeof d === 'string' && d.startsWith(dateKey)) ||
          (typeof d === 'object' && d.date && d.date.startsWith(dateKey)) ||
          (d instanceof Date && d.toISOString().split('T')[0] === dateKey)
        );
        
        // Retorna true se a tarefa está em list_dates OU completed para esta data
        return isInListDates || isCompleted;
      });
      
      let incompleteTasks = 0;
      let completedTasks = 0;
      let failedTasks = 0;
      
      dayTasks.forEach(task => {
        let taskHasFailed = isPastDay;
        if (isToday && task.time) {
          const [hours, minutes] = task.time.split(':');
          const taskDateTime = new Date();
          taskDateTime.setHours(parseInt(hours), parseInt(minutes), 59, 999);
          if (taskDateTime < new Date()) {
            taskHasFailed = true;
          }
        }

        // Verifica se a tarefa está concluída para esta data
        const isCompletedOnDate = task.completed && task.completed.some(d => {
          if (typeof d === 'string') {
            return d.startsWith(dateKey);
          } else if (typeof d === 'object' && d.date) {
            return d.date.startsWith(dateKey);
          } else if (d instanceof Date) {
            return d.toISOString().split('T')[0] === dateKey;
          }
          return false;
        });

        // Verifica se a tarefa ainda está pendente (em list_dates)
        const isPendingOnDate = task.list_dates.some(d => {
          if (typeof d === 'string') {
            return d.startsWith(dateKey);
          } else if (typeof d === 'object' && d.date) {
            return d.date.startsWith(dateKey);
          } else if (d instanceof Date) {
            return d.toISOString().split('T')[0] === dateKey;
          }
          return false;
        });

        if (isCompletedOnDate) {
          completedTasks++;
        } else if (taskHasFailed && isPendingOnDate) {
          failedTasks++;
        } else if (isPendingOnDate) {
          incompleteTasks++;
        }
      });
      
      days.push({
        date: currentDay,
        isPast: isPastDay,
        isToday: isToday,
        incompleteTasks,
        completedTasks,
        failedTasks,
        totalTasks: dayTasks.length
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
                    <div className="task-count incomplete-circle">
                      {day.incompleteTasks}
                    </div>
                  )}
                  {day.completedTasks > 0 && (
                    <div className="task-count complete-circle">
                      {day.completedTasks}
                    </div>
                  )}
                  {day.failedTasks > 0 && (
                    <div className="task-count failed-circle">
                      {day.failedTasks}
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