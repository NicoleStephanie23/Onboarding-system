const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const registerController = require('../controllers/registerController'); // Añadir esta línea


router.post('/login', authController.login);
router.post('/register', registerController.register);
router.post('/verify', authController.verifyToken);
router.post('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;