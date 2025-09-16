const ShopifyService = require('../services/shopifyService');
const { Tenant } = require('../models');
const logger = require('../utils/logger');

const syncCustomers = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verify tenant belongs to user
    if (req.user.tenantId !== parseInt(tenantId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const shopifyService = new ShopifyService(tenantId);
    const result = await shopifyService.syncCustomers();

    logger.info('Customer sync completed', { tenantId, result });

    res.json({
      message: 'Customer sync completed successfully',
      result
    });
  } catch (error) {
    logger.error('Customer sync error:', error);
    res.status(500).json({ error: 'Customer sync failed', details: error.message });
  }
};

const syncProducts = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verify tenant belongs to user
    if (req.user.tenantId !== parseInt(tenantId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const shopifyService = new ShopifyService(tenantId);
    const result = await shopifyService.syncProducts();

    logger.info('Product sync completed', { tenantId, result });

    res.json({
      message: 'Product sync completed successfully',
      result
    });
  } catch (error) {
    logger.error('Product sync error:', error);
    res.status(500).json({ error: 'Product sync failed', details: error.message });
  }
};

const syncOrders = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verify tenant belongs to user
    if (req.user.tenantId !== parseInt(tenantId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const shopifyService = new ShopifyService(tenantId);
    const result = await shopifyService.syncOrders();

    logger.info('Order sync completed', { tenantId, result });

    res.json({
      message: 'Order sync completed successfully',
      result
    });
  } catch (error) {
    logger.error('Order sync error:', error);
    res.status(500).json({ error: 'Order sync failed', details: error.message });
  }
};

const fullSync = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verify tenant belongs to user
    if (req.user.tenantId !== parseInt(tenantId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const shopifyService = new ShopifyService(tenantId);
    const result = await shopifyService.fullSync();

    logger.info('Full sync completed', { tenantId, result });

    res.json({
      message: 'Full sync completed successfully',
      result
    });
  } catch (error) {
    logger.error('Full sync error:', error);
    res.status(500).json({ error: 'Full sync failed', details: error.message });
  }
};

const getSyncStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verify tenant belongs to user
    if (req.user.tenantId !== parseInt(tenantId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const tenant = await Tenant.findByPk(tenantId);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({
      lastSyncAt: tenant.lastSyncAt,
      isActive: tenant.isActive,
      shopifyDomain: tenant.shopifyDomain
    });
  } catch (error) {
    logger.error('Get sync status error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
};

module.exports = {
  syncCustomers,
  syncProducts,
  syncOrders,
  fullSync,
  getSyncStatus
};
