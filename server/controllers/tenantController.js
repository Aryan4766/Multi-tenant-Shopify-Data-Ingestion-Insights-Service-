const { Tenant, User } = require('../models');
const logger = require('../utils/logger');

const createTenant = async (req, res) => {
  try {
    const { name, shopifyDomain, accessToken, webhookSecret } = req.body;

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({
      where: { shopifyDomain }
    });

    if (existingTenant) {
      return res.status(400).json({ error: 'Tenant with this Shopify domain already exists' });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name,
      shopifyDomain,
      accessToken,
      webhookSecret,
      isActive: true
    });

    logger.info('Tenant created successfully', { tenantId: tenant.id, shopifyDomain });

    res.status(201).json({
      message: 'Tenant created successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        shopifyDomain: tenant.shopifyDomain,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt
      }
    });
  } catch (error) {
    logger.error('Create tenant error:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
};

const getTenants = async (req, res) => {
  try {
    // Only admin users can see all tenants
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tenants = await Tenant.findAll({
      attributes: ['id', 'name', 'shopifyDomain', 'isActive', 'lastSyncAt', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ tenants });
  } catch (error) {
    logger.error('Get tenants error:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
};

const getTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Verify tenant belongs to user or user is admin
    if (req.user.tenantId !== parseInt(tenantId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tenant = await Tenant.findByPk(tenantId, {
      attributes: ['id', 'name', 'shopifyDomain', 'isActive', 'lastSyncAt', 'createdAt', 'settings']
    });

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({ tenant });
  } catch (error) {
    logger.error('Get tenant error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
};

const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { name, isActive, settings } = req.body;

    // Verify tenant belongs to user or user is admin
    if (req.user.tenantId !== parseInt(tenantId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (isActive !== undefined) updates.isActive = isActive;
    if (settings !== undefined) updates.settings = settings;

    await tenant.update(updates);

    logger.info('Tenant updated successfully', { tenantId, updates });

    res.json({
      message: 'Tenant updated successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        shopifyDomain: tenant.shopifyDomain,
        isActive: tenant.isActive,
        lastSyncAt: tenant.lastSyncAt,
        settings: tenant.settings
      }
    });
  } catch (error) {
    logger.error('Update tenant error:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
};

const getTenantUsers = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Verify tenant belongs to user or user is admin
    if (req.user.tenantId !== parseInt(tenantId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await User.findAll({
      where: { tenantId },
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    logger.error('Get tenant users error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant users' });
  }
};

const createTenantUser = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { email, password, firstName, lastName, role = 'viewer' } = req.body;

    // Verify tenant belongs to user or user is admin
    if (req.user.tenantId !== parseInt(tenantId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Verify tenant exists
    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      tenantId,
      isActive: true
    });

    logger.info('Tenant user created successfully', { userId: user.id, tenantId, email });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Create tenant user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

module.exports = {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  getTenantUsers,
  createTenantUser
};
