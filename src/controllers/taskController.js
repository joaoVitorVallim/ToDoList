const User = require('../models/userModel');

// Criar uma nova tarefa
const createTask = async (req, res) => {
  try {
    const { title, description, list_dates, time } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const newTask = {
      title,
      description,
      list_dates,
      time
    };

    user.tasks.push(newTask);
    await user.save();

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Listar todas as tarefas do usuário com filtros
const getTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user.tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar uma tarefa
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, list_dates, completed, time } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const task = user.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    const updatedFields = {};
    if (title) {
      task.title = title;
      updatedFields.title = title;
    }

    if (description) {
      task.description = description;
      updatedFields.description = description;
    }

    if (list_dates) {
      // Verifica se mudou
      const oldDates = (task.list_dates || []).map(d => new Date(d).toISOString()).sort();
      const newDates = (list_dates || []).map(d => new Date(d).toISOString()).sort();
      const mudou = oldDates.length !== newDates.length || oldDates.some((d, i) => d !== newDates[i]);
      task.list_dates = list_dates;
      updatedFields.list_dates = list_dates;
      if (mudou) task.notified = [];
    }

    if (time && time !== task.time) {
      task.time = time;
      updatedFields.time = time;
      task.notified = [];
    } else if (time) {
      task.time = time;
      updatedFields.time = time;
    }

    if (completed !== undefined) {
      task.completed = completed;
      updatedFields.completed = completed;
    }

    await user.save();
    res.status(200).json({ updated: updatedFields });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar tarefa' });
  }
};

// Deletar uma tarefa
const deleteTask = async (req, res) => {
  try {
    const { taskId, date } = req.params;
    const userId = req.user._id;

    if (!taskId) {
      return res.status(400).json({ message: 'ID da tarefa é obrigatório' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const task = user.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ message: 'Data inválida' });
      }

      task.list_dates = task.list_dates.filter(d => {
        const dDate = new Date(d);
        return dDate.toISOString() !== parsedDate.toISOString();
      });
    } else {
      user.tasks.pull(taskId);
    }


    await user.save();

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkedTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    const { datesToMove } = req.body;

    if (!datesToMove || !Array.isArray(datesToMove) || datesToMove.length === 0) {
      return res.status(400).json({ message: 'Datas são obrigatórias' });
    }

    if (!taskId) {
      return res.status(400).json({ message: 'ID da tarefa é obrigatório' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const task = user.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    datesToMove.forEach(dateStr => {
      const parsedDate = new Date(dateStr);
      if (isNaN(parsedDate)) {
        throw new Error(`Data inválida: ${dateStr}`);
      }

      const dateISO = parsedDate.toISOString();

      const isInListDates = task.list_dates.findIndex(d => new Date(d).toISOString() === dateISO);
      const isInCompleted = task.completed.findIndex(d => new Date(d).toISOString() === dateISO);

      if (isInListDates !== -1) {
        // 🔄 Está em list_dates → Move para completed
        const [removedDate] = task.list_dates.splice(isInListDates, 1);
        task.completed.push(removedDate);
      } else if (isInCompleted !== -1) {
        // 🔄 Está em completed → Volta para list_dates
        const [removedDate] = task.completed.splice(isInCompleted, 1);
        task.list_dates.push(removedDate);
      } else {
        throw new Error(`Data ${dateStr} não encontrada em list_dates nem em completed`);
      }
    });
    await user.save();

    res.json({ message: 'Status da(s) data(s) alterado com sucesso', task });
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao alterar status da(s) data(s)',
      error: error.message
    });
  }
};


module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  checkedTask
};