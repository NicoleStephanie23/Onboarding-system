const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = this.createTransporter();
        console.log('📧 EmailService inicializado para Gmail');
    }

    createTransporter() {
        console.log('🚀 Configurando Gmail SMTP...');

        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'nicolstephanieb.q@gmail.com',
                pass: process.env.EMAIL_PASS || 'kxvb ctpk uubt qobx'
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendAlertEmail(to, subject, htmlContent) {
        try {
            const mailOptions = {
                from: `"Sistema de Onboarding" <${process.env.EMAIL_USER || 'nicolstephanieb.q@gmail.com'}>`,
                to: Array.isArray(to) ? to.join(', ') : to,
                subject: subject,
                html: htmlContent,
                text: this.htmlToText(htmlContent),
                encoding: 'utf-8'
            };

            console.log('📤 Enviando email vía Gmail...');
            console.log(`   De: ${mailOptions.from}`);
            console.log(`   Para: ${to}`);
            console.log(`   Asunto: ${subject}`);

            const info = await this.transporter.sendMail(mailOptions);

            console.log('✅ Email enviado exitosamente vía Gmail');
            console.log(`   Message ID: ${info.messageId}`);
            console.log(`   Response: ${info.response}`);

            return {
                success: true,
                messageId: info.messageId,
                response: info.response
            };

        } catch (error) {
            console.error('❌ Error enviando email Gmail:', error.message);
            console.error('   Código error:', error.code);
            console.error('   Comando SMTP:', error.command);

            if (error.code === 'EAUTH') {
                console.error('   🔒 Problema de autenticación. Soluciones:');
                console.error('   1. Verifica usuario y contraseña');
                console.error('   2. Activa "Acceso de aplicaciones menos seguras"');
                console.error('   3. O usa "Contraseña de aplicación"');
                console.error('   URL: https://myaccount.google.com/apppasswords');
            }

            throw error;
        }
    }

    htmlToText(html) {
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
    }

    generateNewEventAlert(event) {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Nuevo Evento Técnico Creado</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3498db; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .event-details { background: white; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>📅 Nuevo Evento Técnico Creado</h2>
        </div>
        
        <div class="content">
            <p>Se ha creado un nuevo evento técnico en el sistema de onboarding:</p>
            
            <div class="event-details">
                <h3>${event.title}</h3>
                <p><strong>📋 Tipo:</strong> ${event.type === 'journey_to_cloud' ? 'Journey to Cloud' : 'Capítulo Técnico'}</p>
                <p><strong>📅 Fecha inicio:</strong> ${startDate.toLocaleDateString('es-ES')}</p>
                <p><strong>📅 Fecha fin:</strong> ${endDate.toLocaleDateString('es-ES')}</p>
                <p><strong>⏱️ Duración:</strong> ${duration} días</p>
                <p><strong>👤 Responsable:</strong> ${event.responsible_email}</p>
                ${event.description ? `<p><strong>📝 Descripción:</strong> ${event.description}</p>` : ''}
                ${event.location ? `<p><strong>📍 Ubicación:</strong> ${event.location}</p>` : ''}
                ${event.max_participants ? `<p><strong>👥 Participantes máx:</strong> ${event.max_participants}</p>` : ''}
            </div>
            
            <p>Este evento ya está programado en el calendario del sistema y aparecerá en la página de alertas.</p>
            
            <a href="http://localhost:3000/alerts" class="button">Ver Alertas</a>
            
            <div class="footer">
                <p>Esta es una alerta automática del Sistema de Gestión de Onboarding.</p>
                <p>© ${new Date().getFullYear()} Onboarding System</p>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    generateTestEmail() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Prueba del Sistema de Alertas</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .success-icon { font-size: 48px; color: #2ecc71; margin-bottom: 10px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h1>Prueba del Sistema de Alertas</h1>
            <p>Sistema de Gestión de Onboarding</p>
        </div>
        
        <div class="content">
            <p>Hola,</p>
            <p>Este es un email de prueba para verificar que el sistema de alertas está funcionando correctamente.</p>
            <p><strong>Fecha de prueba:</strong> ${new Date().toLocaleString('es-ES')}</p>
            <p><strong>Estado del sistema:</strong> ✅ FUNCIONANDO CORRECTAMENTE</p>
            <p>Las alertas se enviarán automáticamente cuando se creen nuevos eventos en el calendario.</p>
        </div>
        
        <div class="footer">
            <p>Esta es una prueba automática del Sistema de Gestión de Onboarding.</p>
            <p>© ${new Date().getFullYear()} Onboarding System v1.0.0</p>
        </div>
    </div>
</body>
</html>`;
    }
}

module.exports = new EmailService();