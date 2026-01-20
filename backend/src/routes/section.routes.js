const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/section.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', sectionController.createSection);
router.get('/', sectionController.getSections);
router.get('/:id', sectionController.getSectionById);
router.put('/:id', sectionController.updateSection);
router.delete('/:id', sectionController.deleteSection);

// Special operations
router.patch('/:id/archive', sectionController.toggleArchiveSection);
router.get('/:id/stats', sectionController.getSectionStats);
router.post('/:id/duplicate', sectionController.duplicateSection);

module.exports = router;