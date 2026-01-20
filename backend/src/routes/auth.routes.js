const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validateLogin, validateProfileSetup, validatePreferences, handleValidation } = require('../middleware/validate');


// Public routes
router.post('/register', authController.register);
router.post('/login', validateLogin, handleValidation, authController.login);
router.post('/validate-token', authController.validateToken); // For manual token validation

// Protected routes (require authentication)
router.get('/me', authenticate, authController.getProfile);
router.post('/setup-profile', authenticate, validateProfileSetup, handleValidation, authController.setupProfile);
router.put('/preferences', authenticate, validatePreferences, handleValidation, authController.updatePreferences);
router.post('/logout', authenticate, authController.logout);
router.delete('/account', authenticate, authController.deleteAccount);

module.exports = router;