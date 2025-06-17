const User = require('../models/userModel');

// Criar uma nova tarefa
const createTask = async (req, res) => {
  try {
    const { title, description, schedule } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const newTask = {
      title,
      description,
      completed: false,
      createdAt: new Date(),
      schedule: schedule || {
        type: 'daily',
        lastCompleted: null
      }
    };

    user.tasks.push(newTask);
    await user.save();

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar tarefa' });
  }
};

// Função auxiliar para verificar se uma tarefa deve aparecer em um dia específico
const shouldTaskAppearOnDay = (task, targetDate) => {
  const { schedule } = task;
  if (!schedule) return true;

  const targetDay = targetDate.getDay();
  const targetDateOfMonth = targetDate.getDate();

  switch (schedule.type) {
    case 'daily':
      return true;

    case 'weekly':
      return schedule.days.includes(targetDay);

    case 'monthly':
      return schedule.dayOfMonth === targetDateOfMonth;

    case 'biweekly':
      if (!schedule.lastCompleted) return true;
      const daysSinceLast = Math.floor((targetDate - schedule.lastCompleted) / (1000 * 60 * 60 * 24));
      return daysSinceLast >= 14;

    case 'custom':
      if (!schedule.lastCompleted) return true;
      const daysSinceLastCustom = Math.floor((targetDate - schedule.lastCompleted) / (1000 * 60 * 60 * 24));
      return daysSinceLastCustom >= schedule.interval;

    default:
      return true;
  }
};

// Listar todas as tarefas do usuário com filtros
const getTasks = async (req, res) => {
  try {
    const { date, type } = req.query;
    const userId = req.user._id;

    let query = { userId };
    let tasks = [];

    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // Buscar tarefas que se aplicam à data específica
      tasks = await User.find({
        userId,
        $or: [
          // Tarefas diárias
          { 'schedule.type': 'daily' },
          // Tarefas semanais no dia específico
          {
            'schedule.type': 'weekly',
            'schedule.days': targetDate.getDay()
          },
          // Tarefas quinzenais
          {
            'schedule.type': 'biweekly',
            $expr: {
              $eq: [
                { $mod: [{ $divide: [{ $subtract: [targetDate, new Date('2024-01-01')] }, 1000 * 60 * 60 * 24] }, 14] },
                0
              ]
            }
          },
          // Tarefas mensais no dia específico
          {
            'schedule.type': 'monthly',
            'schedule.dayOfMonth': targetDate.getDate()
          },
          // Tarefas personalizadas
          {
            'schedule.type': 'custom',
            $expr: {
              $eq: [
                { $mod: [{ $divide: [{ $subtract: [targetDate, new Date('2024-01-01')] }, 1000 * 60 * 60 * 24] }, '$schedule.interval'] },
                0
              ]
            }
          },
          // Tarefas em data específica
          {
            'schedule.type': 'specific',
            'schedule.specificDate': {
              $gte: targetDate,
              $lt: nextDate
            }
          }
        ]
      });
    } else if (type) {
      tasks = await User.find({ ...query, 'schedule.type': type });
    } else {
      tasks = await User.find(query);
    }

    // Organizar tarefas por dia da semana
    const tasksByDay = {
      domingo: [],
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: [],
      sabado: []
    };

    tasks.forEach(task => {
      if (task.schedule.type === 'weekly') {
        task.schedule.days.forEach(day => {
          const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
          tasksByDay[dayNames[day]].push(task);
        });
      } else if (task.schedule.type === 'specific') {
        const specificDate = new Date(task.schedule.specificDate);
        const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        tasksByDay[dayNames[specificDate.getDay()]].push(task);
      } else {
        // Para outros tipos, adicionar em todos os dias
        Object.keys(tasksByDay).forEach(day => {
          tasksByDay[day].push(task);
        });
      }
    });

    res.json({ tasks, tasksByDay });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar uma tarefa
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, completed, schedule } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const task = user.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (completed !== undefined) {
      task.completed = completed;
      if (completed) {
        task.schedule.lastCompleted = new Date();
      }
    }
    if (schedule) {
      task.schedule = { ...task.schedule, ...schedule };
    }

    await user.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar tarefa' });
  }
};

// Deletar uma tarefa
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const task = user.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    user.tasks.pull(taskId);
    await user.save();

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar tarefa' });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
}; 