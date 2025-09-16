const express = require('express');
const { 
  getDashboardStats, 
  getCustomerAnalytics, 
  getOrderAnalytics, 
  getProductAnalytics 
} = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Analytics routes
router.get('/:tenantId/dashboard', getDashboardStats);
router.get('/:tenantId/customers', getCustomerAnalytics);
router.get('/:tenantId/orders', getOrderAnalytics);
router.get('/:tenantId/products', getProductAnalytics);

module.exports = router;
