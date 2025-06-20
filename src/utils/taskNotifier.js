const cron = require('node-cron');
const dayjs = require('dayjs');
const User = require('../models/userModel');
const sendEmail = require('./sendEmail');

// Minutos de antecedência para notificação
const MINUTOS_ANTES = 10;

cron.schedule('* * * * *', async () => {
  try {
    const agora = dayjs();
    const alvo = agora.add(MINUTOS_ANTES, 'minute');

    // Buscar todos os usuários
    const users = await User.find();
    for (const user of users) {
      if (!user.notificationsEnabled) continue;
      for (const task of user.tasks) {
        // Para cada data da task ainda não concluída
        if (!task.list_dates || !Array.isArray(task.list_dates)) continue;
        for (const date of task.list_dates) {
          // Verifica se já foi notificado para esta data
          const jaNotificado = task.notified && task.notified.some(d => dayjs(d).isSame(dayjs(date), 'minute'));
          if (jaNotificado) continue;
          // Verifica se a data está dentro do range de notificação
          const dataTask = dayjs(date).hour(Number(task.time.split(':')[0])).minute(Number(task.time.split(':')[1]));
          if (
            dataTask.isAfter(agora) &&
            dataTask.isBefore(alvo)
          ) {
            // Enviar notificação
            await sendEmail({
              to: user.email,
              subject: `Lembrete: Tarefa "${task.title}" próxima do prazo!`,
              html: `
                <body style="background: #f4f4f4; padding: 0; margin: 0;">
                  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 32px 28px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #2e7d32; margin-top: 0; margin-bottom: 18px; font-weight: 700; font-size: 1.6rem; letter-spacing: 1px;">Lembrete de Tarefa</h2>
                    <p style="color: #333; font-size: 1.05rem; margin-bottom: 18px;">Olá <strong>${user.name}</strong>,</p>
                    <p style="color: #444; margin-bottom: 18px;">Sua tarefa:</p>
                    <div style="background: #f1f8e9; border-left: 4px solid #4CAF50; padding: 16px 18px; border-radius: 6px; margin-bottom: 22px;">
                      <span style="font-size: 1.15rem; color: #222; font-weight: 600;">${task.title}</span>
                    </div>
                    <p style="color: #444; margin-bottom: 10px;">Está programada para:</p>
                    <div style="text-align: center; margin: 18px 0 28px 0;">
                      <span style="display: inline-block; background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%); color: #fff; padding: 16px 32px; border-radius: 8px; font-size: 1.25rem; font-weight: bold; letter-spacing: 2px; box-shadow: 0 2px 8px rgba(67,233,123,0.10);">
                        ${dataTask.format('DD/MM/YYYY [às] HH:mm')}
                      </span>
                    </div>
                    <p style="color: #333; margin-bottom: 24px;">Não se esqueça de concluí-la! Se já concluiu, pode ignorar este lembrete.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 18px 0;">
                    <p style="font-size: 12px; color: #aaa; text-align: center;">© 2025 Meu App. Todos os direitos reservados.</p>
                  </div>
                </body>
              `
            });
            // Marcar como notificado
            if (!task.notified) task.notified = [];
            task.notified.push(date);
            await user.save();
          }
        }
      }
    }
  } catch (err) {
    console.error('Erro ao enviar notificações de tasks:', err);
  }
}); 