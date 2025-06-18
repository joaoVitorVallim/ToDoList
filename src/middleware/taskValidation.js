const validateTask = (req, res, next) => {
  const { title, description, list_dates, time } = req.body;
  // Validação dos campos obrigatórios
  if (!title || !description || !time) {
    return res.status(400).json({ 
      message: 'Título, descrição e hora são obrigatórios' 
    });
  }

  // Validação das datas
  if (!Array.isArray(list_dates) || list_dates.length === 0) {
    return res.status(400).json({ 
      message: 'É necessário fornecer uma lista de datas' 
    });
  }

  // Validação do formato das datas
  const invalidDates = list_dates.filter(date => isNaN(new Date(date).getTime()));
  if (invalidDates.length > 0) {
    return res.status(400).json({ 
      message: 'Uma ou mais datas são inválidas', 
      invalidDates 
    });
  }

  // Validação do formato do horário (HH:mm)
  if (time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({ 
        message: 'Formato de horário inválido. Use HH:mm (ex: 14:30)' 
      });
    }
  }

  next();
};


const validateUpdateTask = (req, res, next) => {
  const { taskId } = req.params;
  const { title, description, list_dates, completed, time } = req.body;
  
  if (!taskId) {
    return res.status(400).json({ message: 'ID da tarefa é obrigatório' });
  }
  if (!title && !description && completed === undefined && !list_dates && !time) {
    return res.status(400).json({ message: 'Pelo menos um campo deve ser atualizado' });
  }

  next();
}


module.exports = { validateTask, validateUpdateTask };