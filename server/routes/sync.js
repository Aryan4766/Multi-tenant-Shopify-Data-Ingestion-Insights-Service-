const express = require('express');
const { 
  syncCustomers, 
  syncProducts, 
  syncOrders, 
  fullSync, 
  getSyncStatus 
} = require('../controllers/syncController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Sync routes
router.post('/:tenantId/customers', syncCustomers);
router.post('/:tenantId/products', syncProducts);
router.post('/:tenantId/orders', syncOrders);
router.post('/:tenantId/full', fullSync);
router.get('/:tenantId/status', getSyncStatus);

module.exports = router;
