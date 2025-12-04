const AlertService = require('../services/AlertService');
const TechnicalOnboardingCalendar = require('../models/TechnicalOnboardingCalendar');

const alertController = {
    async getUpcoming(req, res) {
        try {
            const events = await AlertService.getUpcomingAlerts();
            res.json(events);
        } catch (error) {
            console.error('Error obteniendo alertas:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async sendTest(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    error: 'Email requerido para enviar prueba'
                });
            }

            const result = await AlertService.sendTestAlert(email);

            res.json({
                success: true,
                message: 'Alerta de prueba enviada por email',
                details: result
            });
        } catch (error) {
            console.error('Error enviando alerta:', error);
            res.status(500).json({
                error: 'Error enviando alerta',
                details: error.message
            });
        }
    },

    async getEventAlerts(req, res) {
        try {
            const { eventId } = req.params;

            const [event] = await pool.execute(
                'SELECT * FROM technical_onboarding_calendar WHERE id = ?',
                [eventId]
            );

            if (!event.length) {
                return res.status(404).json({ error: 'Evento no encontrado' });
            }

            const alerts = [
                {
                    id: 1,
                    type: 'creation',
                    sent_at: new Date(event[0].created_at),
                    recipients: [event[0].responsible_email],
                    status: 'sent'
                },
                {
                    id: 2,
                    type: 'weekly_reminder',
                    scheduled_for: new Date(new Date(event[0].start_date).setDate(
                        new Date(event[0].start_date).getDate() - 7
                    )),
                    status: 'scheduled'
                }
            ];

            res.json({
                event: event[0],
                alerts: alerts
            });
        } catch (error) {
            console.error('Error obteniendo alertas del evento:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

module.exports = alertController;