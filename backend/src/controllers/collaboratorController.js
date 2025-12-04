const Collaborator = require('../models/Collaborator');

const collaboratorController = {

  async getAll(req, res) {
    try {
      const filters = {
        status: req.query.status,
        search: req.query.search
      };

      const collaborators = await Collaborator.findAll(filters);
      res.json(collaborators);
    } catch (error) {
      console.error('❌ Error obteniendo colaboradores:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const collaborator = await Collaborator.findById(req.params.id);

      if (!collaborator) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      res.json(collaborator);
    } catch (error) {
      console.error('❌ Error obteniendo colaborador:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async create(req, res) {
    try {
      console.log('➕ POST /collaborators - Creando nuevo colaborador');
      console.log('📦 Datos recibidos:', req.body);

      if (!req.body.full_name || !req.body.email || !req.body.hire_date) {
        return res.status(400).json({
          error: 'Faltan campos requeridos: full_name, email, hire_date'
        });
      }

      const newCollaborator = await Collaborator.create(req.body);
      console.log('✅ Colaborador creado:', newCollaborator);

      res.status(201).json(newCollaborator);
    } catch (error) {
      console.error('❌ Error creando colaborador:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          error: 'El email ya está registrado'
        });
      }

      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async update(req, res) {
    try {
      console.log('✏️ PUT /collaborators/:id - ID:', req.params.id);
      console.log('📦 Datos para actualizar:', req.body);

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          error: 'No hay datos para actualizar'
        });
      }

      const updated = await Collaborator.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      res.json({
        success: true,
        message: 'Colaborador actualizado',
        id: req.params.id
      });
    } catch (error) {
      console.error('❌ Error actualizando colaborador:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      console.log('🗑️ DELETE /collaborators/:id - ID:', req.params.id);

      const deleted = await Collaborator.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      res.json({
        success: true,
        message: 'Colaborador eliminado',
        id: req.params.id
      });
    } catch (error) {
      console.error('❌ Error eliminando colaborador:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  async completeOnboarding(req, res) {
    try {
      console.log('✅ POST /collaborators/:id/complete-onboarding');
      console.log('📦 ID:', req.params.id, 'Tipo:', req.body.type);

      const { type } = req.body;

      if (!type || (type !== 'welcome' && type !== 'technical')) {
        return res.status(400).json({
          error: 'Tipo de onboarding inválido. Use "welcome" o "technical"'
        });
      }

      const completed = await Collaborator.completeOnboarding(req.params.id, type);

      if (!completed) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      res.json({
        success: true,
        message: `Onboarding ${type} marcado como completado`,
        id: req.params.id
      });
    } catch (error) {
      console.error('❌ Error completando onboarding:', error);
      res.status(400).json({
        error: error.message || 'Error completando onboarding'
      });
    }
  }
};

module.exports = collaboratorController;