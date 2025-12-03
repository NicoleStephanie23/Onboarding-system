const express = require('express');
const router = express.Router();
const collaboratorController = require('../controllers/collaboratorController');

router.get('/', collaboratorController.getAll);
router.get('/:id', collaboratorController.getById);
router.post('/', collaboratorController.create);
router.put('/:id', collaboratorController.update);
router.delete('/:id', collaboratorController.delete);
router.post('/:id/complete-onboarding', collaboratorController.completeOnboarding);

module.exports = router;
