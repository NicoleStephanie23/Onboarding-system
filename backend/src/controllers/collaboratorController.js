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
      console.error('Error obteniendo colaboradores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
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
      console.error('Error obteniendo colaborador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async create(req, res) {
    try {
      const newCollaborator = await Collaborator.create(req.body);
      res.status(201).json(newCollaborator);
    } catch (error) {
      console.error('Error creando colaborador:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async update(req, res) {
    try {
      const updated = await Collaborator.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      res.json({ success: true, message: 'Colaborador actualizado' });
    } catch (error) {
      console.error('Error actualizando colaborador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await Collaborator.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      res.json({ success: true, message: 'Colaborador eliminado' });
    } catch (error) {
      console.error('Error eliminando colaborador:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  async completeOnboarding(req, res) {
    try {
      const { type } = req.body;
      const completed = await Collaborator.completeOnboarding(req.params.id, type);

      if (!completed) {
        return res.status(404).json({ error: 'Colaborador no encontrado' });
      }

      res.json({ success: true, message: `Onboarding ${type} marcado como completado` });
    } catch (error) {
      console.error('Error completando onboarding:', error);
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = collaboratorController;
