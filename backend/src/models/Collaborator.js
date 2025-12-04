const { pool } = require('../config/database');

class Collaborator {

  static async create(collaboratorData) {
    console.log('➕ Collaborator.create() llamado');
    console.log('📋 Datos recibidos:', collaboratorData);

    try {
      const {
        full_name,
        email,
        hire_date,
        welcome_onboarding_status = 'pending',
        technical_onboarding_status = 'pending',
        technical_onboarding_date = null
      } = collaboratorData;

      if (!full_name || !email || !hire_date) {
        throw new Error('Faltan campos requeridos: full_name, email, hire_date');
      }

      const query = `
        INSERT INTO collaborators 
        (full_name, email, hire_date, welcome_onboarding_status, 
         technical_onboarding_status, technical_onboarding_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const values = [
        full_name,
        email,
        hire_date,
        welcome_onboarding_status,
        technical_onboarding_status,
        technical_onboarding_date
      ];

      console.log('📋 Query:', query);
      console.log('🎯 Valores:', values);

      const [result] = await pool.execute(query, values);
      console.log('✅ Query ejecutada. ID insertado:', result.insertId);
      const [rows] = await pool.execute(
        'SELECT * FROM collaborators WHERE id = ?',
        [result.insertId]
      );

      return rows[0];

    } catch (error) {
      console.error('❌ ERROR en Collaborator.create():');
      console.error('   Mensaje:', error.message);
      console.error('   Código:', error.code);
      console.error('   SQL:', error.sql);
      console.error('   Stack:', error.stack);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    console.log('🔍 Collaborator.findAll() llamado');
    console.log('📋 Filtros:', filters);

    try {
      let query = 'SELECT * FROM collaborators WHERE 1=1';
      const params = [];

      if (filters.search) {
        query += ' AND (full_name LIKE ? OR email LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm);
      }

      if (filters.status) {
        query += ' AND (welcome_onboarding_status = ? OR technical_onboarding_status = ?)';
        params.push(filters.status, filters.status);
      }

      query += ' ORDER BY hire_date DESC';

      console.log('📋 Query:', query);
      console.log('🎯 Parámetros:', params);

      const [rows] = await pool.execute(query, params);
      console.log(`✅ ${rows.length} colaboradores encontrados`);

      return rows;
    } catch (error) {
      console.error('❌ ERROR en Collaborator.findAll():');
      console.error('   Mensaje:', error.message);
      console.error('   Código:', error.code);
      console.error('   SQL:', error.sql);
      throw error;
    }
  }

  static async findById(id) {
    console.log('🔍 Collaborator.findById() llamado');
    console.log('📋 ID:', id);

    try {
      const [rows] = await pool.execute(
        'SELECT * FROM collaborators WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        console.log('⚠️ Colaborador no encontrado');
        return null;
      }

      console.log('✅ Colaborador encontrado');
      return rows[0];
    } catch (error) {
      console.error('❌ ERROR en Collaborator.findById():');
      console.error('   Mensaje:', error.message);
      console.error('   Código:', error.code);
      console.error('   SQL:', error.sql);
      throw error;
    }
  }

  static async update(id, collaboratorData) {
    console.log('✏️ Collaborator.update() llamado');
    console.log('   ID:', id);
    console.log('   Datos:', collaboratorData);

    try {
      if (!collaboratorData || Object.keys(collaboratorData).length === 0) {
        console.log('⚠️  No hay datos para actualizar');
        throw new Error('No hay datos para actualizar');
      }

      const fields = [];
      const values = [];
      const validFields = ['full_name', 'email', 'hire_date', 'welcome_onboarding_status', 'technical_onboarding_status', 'technical_onboarding_date'];

      console.log('📝 Procesando campos:');
      for (const [key, value] of Object.entries(collaboratorData)) {
        console.log(`   ${key}: ${value} (type: ${typeof value})`);

        if (validFields.includes(key) && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) {
        console.log('⚠️  No hay campos válidos para actualizar');
        throw new Error('No hay campos válidos para actualizar');
      }

      values.push(id);
      const query = `UPDATE collaborators SET ${fields.join(', ')} WHERE id = ?`;

      console.log('📋 Query final:', query);
      console.log('🎯 Valores:', values);

      console.log('🚀 Ejecutando query...');
      const [result] = await pool.execute(query, values);
      console.log('✅ Query ejecutada. Filas afectadas:', result.affectedRows);

      return result.affectedRows > 0;

    } catch (error) {
      console.error('❌ ERROR en Collaborator.update():');
      console.error('   Mensaje:', error.message);
      console.error('   Código:', error.code);
      console.error('   SQL:', error.sql);
      throw error;
    }
  }

  static async delete(id) {
    console.log('🗑️ Collaborator.delete() llamado');
    console.log('📋 ID:', id);

    try {
      const [result] = await pool.execute(
        'DELETE FROM collaborators WHERE id = ?',
        [id]
      );

      console.log('✅ Filas afectadas:', result.affectedRows);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ ERROR en Collaborator.delete():');
      console.error('   Mensaje:', error.message);
      console.error('   Código:', error.code);
      console.error('   SQL:', error.sql);
      throw error;
    }
  }

  static async completeOnboarding(id, type) {
    console.log('✅ Collaborator.completeOnboarding() llamado');
    console.log(`📋 ID: ${id}, Tipo: ${type}`);

    try {
      let query, values;

      if (type === 'welcome') {
        query = 'UPDATE collaborators SET welcome_onboarding_status = ? WHERE id = ?';
        values = ['completed', id];
      } else if (type === 'technical') {
        query = 'UPDATE collaborators SET technical_onboarding_status = ?, technical_onboarding_date = CURDATE() WHERE id = ?';
        values = ['completed', id];
      } else {
        throw new Error('Tipo de onboarding no válido. Use "welcome" o "technical"');
      }

      console.log('📋 Query:', query);
      console.log('🎯 Valores:', values);

      const [result] = await pool.execute(query, values);

      if (result.affectedRows === 0) {
        console.log('⚠️ Colaborador no encontrado');
        return false;
      }

      console.log('✅ Onboarding completado');
      return true;
    } catch (error) {
      console.error('❌ ERROR en Collaborator.completeOnboarding():');
      console.error('   Mensaje:', error.message);
      console.error('   Código:', error.code);
      console.error('   SQL:', error.sql);
      throw error;
    }
  }
}

module.exports = Collaborator;