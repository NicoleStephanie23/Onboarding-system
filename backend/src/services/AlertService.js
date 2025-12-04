const EmailService = require('./emailService');
const { pool } = require('../config/database');

class AlertService {
    constructor() {
        console.log('🔔 AlertService inicializado');
    }

    async sendNewEventAlert(event) {
        try {
            console.log('📧 Enviando alerta de nuevo evento...');
            console.log('📋 Evento:', {
                title: event.title,
                fecha_inicio: event.start_date,
                responsable: event.responsible_email
            });

            if (event.responsible_email) {
                try {
                    await EmailService.sendAlertEmail(
                        event.responsible_email,
                        `🎯 Nuevo Evento Asignado: ${event.title}`,
                        EmailService.generateNewEventAlert(event)
                    );
                    console.log(`✅ Alerta enviada al responsable: ${event.responsible_email}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando al responsable ${event.responsible_email}:`, emailError.message);
                }
            }
            const systemEmail = process.env.EMAIL_USER;
            if (systemEmail && systemEmail !== event.responsible_email) {
                try {
                    await EmailService.sendAlertEmail(
                        systemEmail,
                        `📋 Sistema Onboarding: Nuevo Evento - ${event.title}`,
                        EmailService.generateNewEventAlert(event)
                    );
                    console.log(`✅ Copia enviada al sistema: ${systemEmail}`);
                } catch (emailError) {
                    console.error(`❌ Error enviando copia al sistema ${systemEmail}:`, emailError.message);
                }
            }
            try {
                const [admins] = await pool.execute(
                    `SELECT email FROM users 
                     WHERE role IN ('admin', 'manager') 
                     AND is_active = TRUE
                     AND email != ?`,
                    [event.responsible_email || '']
                );

                for (const admin of admins) {
                    if (admin.email !== event.responsible_email && admin.email !== systemEmail) {
                        try {
                            await EmailService.sendAlertEmail(
                                admin.email,
                                `📅 Nuevo Evento Técnico: ${event.title}`,
                                EmailService.generateNewEventAlert(event)
                            );
                            console.log(`✅ Alerta enviada a admin: ${admin.email}`);
                        } catch (adminError) {
                            console.error(`❌ Error enviando a admin ${admin.email}:`, adminError.message);
                        }
                    }
                }
            } catch (dbError) {
                console.warn('⚠️ No se pudieron obtener administradores:', dbError.message);
            }

            console.log(`✅ Proceso de alertas completado para: ${event.title}`);
            return {
                success: true,
                message: 'Alertas enviadas exitosamente'
            };

        } catch (error) {
            console.error('❌ Error en sendNewEventAlert:', error.message);
            throw error;
        }
    }

    async sendTestAlert(email) {
        try {
            console.log(`🧪 Enviando alerta de prueba a: ${email}`);

            const result = await EmailService.sendAlertEmail(
                email,
                '🔔 Prueba del Sistema de Alertas - Onboarding System',
                EmailService.generateTestEmail()
            );

            console.log('✅ Alerta de prueba enviada exitosamente');

            return {
                success: true,
                message: 'Alerta de prueba enviada correctamente',
                details: result
            };

        } catch (error) {
            console.error('❌ Error enviando alerta de prueba:', error.message);
            throw error;
        }
    }

    async getUpcomingAlerts() {
        try {
            console.log('🔍 Obteniendo alertas próximas...');

            const [events] = await pool.execute(
                `SELECT *, 
                 DATEDIFF(start_date, CURDATE()) as days_until,
                 CASE 
                    WHEN DATEDIFF(start_date, CURDATE()) = 0 THEN 'hoy'
                    WHEN DATEDIFF(start_date, CURDATE()) = 1 THEN 'mañana'
                    WHEN DATEDIFF(start_date, CURDATE()) <= 7 THEN 'esta_semana'
                    ELSE 'proximo'
                 END as alert_priority
                 FROM technical_onboarding_calendar 
                 WHERE start_date >= CURDATE() 
                 ORDER BY start_date ASC 
                 LIMIT 50`
            );

            console.log(`✅ ${events.length} eventos próximos encontrados`);
            return events;

        } catch (error) {
            console.error('❌ Error en getUpcomingAlerts:', error.message);
            if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
                console.warn('⚠️ Tabla de calendario no encontrada, devolviendo array vacío');
                return [];
            }

            throw error;
        }
    }

    async getAlertStats() {
        try {
            const [stats] = await pool.execute(`
                SELECT 
                    COUNT(*) as total_events,
                    SUM(CASE WHEN DATEDIFF(start_date, CURDATE()) <= 7 THEN 1 ELSE 0 END) as events_next_7_days,
                    SUM(CASE WHEN DATEDIFF(start_date, CURDATE()) = 0 THEN 1 ELSE 0 END) as events_today
                FROM technical_onboarding_calendar
                WHERE start_date >= CURDATE()
            `);

            return stats[0] || {
                total_events: 0,
                events_next_7_days: 0,
                events_today: 0
            };

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error.message);
            return {
                total_events: 0,
                events_next_7_days: 0,
                events_today: 0
            };
        }
    }
}

module.exports = new AlertService();