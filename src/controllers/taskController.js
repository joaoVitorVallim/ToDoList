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
      task.list_dates = list_dates;
      updatedFields.list_dates = list_dates;
    }

    if (time) {
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
    const { taskId } = req.params;
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

    user.tasks.pull(taskId);
    await user.save();

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar tarefa' });
  }
};

const checkedTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;
    const { datesToMove } = req.body;

    if (!datesToMove || !Array.isArray(datesToMove) || datesToMove.length === 0) {
      return res.status(400).json({ message: 'Datas para marcar como concluídas são obrigatórias' });
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

    // Verifica se a data existe no list_dates
    const dateIndex = task.list_dates.findIndex(date => date.toISOString() === new Date(datesToMove).toISOString());
    if (dateIndex === -1) throw new Error("Data não encontrada em list_dates");

    // Remove a data de list_dates
    const [removedDate] = task.list_dates.splice(dateIndex, 1);

    // Adiciona a data em completed (se ainda não existir)
    if (!task.completed.some(date => date.toISOString() === removedDate.toISOString())) {
      task.completed.push(removedDate);
    }
    // Marca a tarefa como concluída
    task.lastCompleted = new Date();
    await user.save();
    res.json({ message: 'Tarefa marcada como concluída', task });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao marcar tarefa como concluída', error: error.message });
  }
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  checkedTask
};