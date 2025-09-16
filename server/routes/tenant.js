const express = require('express');
const { 
  createTenant, 
  getTenants, 
  getTenant, 
  updateTenant, 
  getTenantUsers, 
  createTenantUser 
} = require('../controllers/tenantController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Validation middleware
const createTenantValidation = [
  body('name').notEmpty().trim(),
  body('shopifyDomain').isURL().custom(value => {
    if (!value.includes('myshopify.com')) {
      throw new Error('Invalid Shopify domain');
    }
    return true;
  }),
  body('accessToken').notEmpty(),
  body('webhookSecret').optional()
];

const updateTenantValidation = [
  body('name').optional().trim(),
  body('isActive').optional().isBoolean(),
  body('settings').optional().isObject()
];

const createUserValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('role').optional().isIn(['admin', 'viewer'])
];

// Routes
router.post('/', createTenantValidation, createTenant);
router.get('/', requireRole(['admin']), getTenants);
router.get('/:tenantId', getTenant);
router.put('/:tenantId', updateTenantValidation, updateTenant);
router.get('/:tenantId/users', getTenantUsers);
router.post('/:tenantId/users', createUserValidation, createTenantUser);

module.exports = router;
