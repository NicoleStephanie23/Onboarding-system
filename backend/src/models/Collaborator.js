const { pool } = require('../config/database');

class Collaborator {

  static async update(id, collaboratorData) {
    console.log('🔧 Collaborator.update() llamado');
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
      throw error;
    }
  }
}

module.exports = Collaborator;
