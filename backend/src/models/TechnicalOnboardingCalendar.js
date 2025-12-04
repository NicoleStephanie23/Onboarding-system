const { pool } = require('../config/database');

class TechnicalOnboardingCalendar {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM technical_onboarding_calendar WHERE 1=1';
    const params = [];

    if (filters.year) {
      query += ' AND YEAR(start_date) = ?';
      params.push(filters.year);
    }

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    query += ' ORDER BY start_date ASC';

    try {
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  static async create(eventData) {
    const {
      title,
      description,
      type,
      start_date,
      end_date,
      location,
      responsible_email,
      max_participants = 20
    } = eventData;

    const query = `
      INSERT INTO technical_onboarding_calendar 
      (title, description, type, start_date, end_date, location, responsible_email, max_participants, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
    `;

    try {
      const [result] = await pool.execute(query, [
        title,
        description,
        type,
        start_date,
        end_date,
        location || null,
        responsible_email,
        max_participants
      ]);

      return {
        id: result.insertId,
        ...eventData,
        status: 'scheduled'
      };
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  static async getUpcomingEvents(days = 7) {
    const query = `
      SELECT * FROM technical_onboarding_calendar 
      WHERE start_date BETWEEN CURDATE() 
      AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
      AND status = 'scheduled'
      ORDER BY start_date ASC
    `;

    try {
      const [rows] = await pool.execute(query, [days]);
      return rows;
    } catch (error) {
      console.error('Error en getUpcomingEvents:', error);
      throw error;
    }
  }
}

module.exports = TechnicalOnboardingCalendar;