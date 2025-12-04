const TechnicalOnboardingCalendar = require('../models/TechnicalOnboardingCalendar');
const AlertService = require('../services/AlertService');

const calendarController = {
    async getAll(req, res) {
        try {
            const filters = {
                year: req.query.year,
                type: req.query.type
            };

            const events = await TechnicalOnboardingCalendar.findAll(filters);
            res.json(events);
        } catch (error) {
            console.error('Error obteniendo eventos:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async create(req, res) {
        try {
            const { title, start_date, responsible_email } = req.body;

            if (!title || !start_date || !responsible_email) {
                return res.status(400).json({
                    error: 'Título, fecha inicio y email responsable son requeridos'
                });
            }

            const newEvent = await TechnicalOnboardingCalendar.create(req.body);
            await AlertService.sendNewEventAlert(newEvent);

            res.status(201).json({
                success: true,
                message: 'Evento creado y alertas enviadas',
                event: newEvent
            });
        } catch (error) {
            console.error('Error creando evento:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },

    async getUpcomingEvents(req, res) {
        try {
            const days = req.query.days || 7;
            const events = await TechnicalOnboardingCalendar.getUpcomingEvents(days);
            const eventsWithAlerts = await Promise.all(events.map(async (event) => {
                const daysUntil = Math.ceil((new Date(event.start_date) - new Date()) / (1000 * 60 * 60 * 24));
                return {
                    ...event,
                    days_until: daysUntil,
                    alert_status: daysUntil <= 7 ? 'pending' : 'scheduled'
                };
            }));

            res.json(eventsWithAlerts);
        } catch (error) {
            console.error('Error obteniendo eventos próximos:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

module.exports = calendarController;