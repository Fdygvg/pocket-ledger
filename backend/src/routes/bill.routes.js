const express = require('express');
const router = express.Router();
const billController = require('../controllers/bill.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', billController.createBill);
router.get('/', billController.getBills);
router.get('/:id', billController.getBillById);
router.put('/:id', billController.updateBill);
router.delete('/:id', billController.deleteBill);

// Tag management
router.get('/tags/recent', billController.getRecentTags);
router.get('/tags/stats', billController.getTagStatistics);

// Bulk operations
router.delete('/bulk', billController.bulkDeleteBills);

module.exports = router;