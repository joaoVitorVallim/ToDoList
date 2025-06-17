const validateTask = (req, res, next) => {
  const { title, description, schedule } = req.body;

  // Validação dos campos obrigatórios
  if (!title || !description) {
    return res.status(400).json({ 
      message: 'Título e descrição são obrigatórios' 
    });
  }

  // Validação do agendamento
  if (schedule) {
    // Validação do tipo de agendamento
    const validTypes = ['daily', 'weekly', 'biweekly', 'monthly', 'custom', 'specific'];
    if (!validTypes.includes(schedule.type)) {
      return res.status(400).json({ 
        message: 'Tipo de agendamento inválido. Use: daily, weekly, biweekly, monthly, custom ou specific' 
      });
    }

    // Validação específica para cada tipo
    switch (schedule.type) {
      case 'weekly':
        if (!schedule.days || !Array.isArray(schedule.days) || schedule.days.length === 0) {
          return res.status(400).json({ 
            message: 'Para agendamento semanal, é necessário especificar os dias da semana' 
          });
        }
        // Validar se os dias são válidos (0-6)
        if (schedule.days.some(day => day < 0 || day > 6)) {
          return res.status(400).json({ 
            message: 'Dias da semana devem ser números entre 0 (Domingo) e 6 (Sábado)' 
          });
        }
        break;

      case 'monthly':
        if (!schedule.dayOfMonth || schedule.dayOfMonth < 1 || schedule.dayOfMonth > 31) {
          return res.status(400).json({ 
            message: 'Para agendamento mensal, é necessário especificar um dia do mês válido (1-31)' 
          });
        }
        break;

      case 'specific':
        if (!schedule.specificDate) {
          return res.status(400).json({ 
            message: 'Para agendamento específico, é necessário especificar a data' 
          });
        }
        // Validar se a data é válida e não é no passado
        const specificDate = new Date(schedule.specificDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(specificDate.getTime())) {
          return res.status(400).json({ 
            message: 'Data específica inválida' 
          });
        }
        
        if (specificDate < today) {
          return res.status(400).json({ 
            message: 'A data específica não pode ser no passado' 
          });
        }
        break;

      case 'custom':
        if (!schedule.interval || schedule.interval < 1) {
          return res.status(400).json({ 
            message: 'Para agendamento personalizado, é necessário especificar um intervalo válido (mínimo 1 dia)' 
          });
        }
        break;
    }

    // Validação do formato do horário (HH:mm)
    if (schedule.time) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(schedule.time)) {
        return res.status(400).json({ 
          message: 'Formato de horário inválido. Use HH:mm (ex: 14:30)' 
        });
      }
    }
  }

  next();
};

module.exports = { validateTask }; 