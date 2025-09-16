const axios = require('axios');
const { Tenant, Customer, Product, Order, OrderItem, SyncLog } = require('../models');
const logger = require('../utils/logger');

class ShopifyService {
  constructor(tenantId) {
    this.tenantId = tenantId;
    this.tenant = null;
    this.apiVersion = process.env.SHOPIFY_API_VERSION || '2025-07';
  }

  async initialize() {
    this.tenant = await Tenant.findByPk(this.tenantId);
    if (!this.tenant) {
      throw new Error('Tenant not found');
    }
    this.baseURL = `https://${this.tenant.shopifyDomain}/admin/api/${this.apiVersion}`;
    this.headers = {
      'X-Shopify-Access-Token': this.tenant.accessToken,
      'Content-Type': 'application/json'
    };
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: this.headers,
        params
      });
      
      // Log API call limits
      const callLimit = response.headers['x-shopify-shop-api-call-limit'];
      if (callLimit) {
        logger.info('Shopify API call limit:', callLimit);
      }
      
      return response.data;
    } catch (error) {
      logger.error('Shopify API request failed:', {
        endpoint,
        error: error.response?.data || error.message,
        status: error.response?.status,
        tenantId: this.tenantId
      });
      throw error;
    }
  }

  async getAllRecords(endpoint, params = {}) {
    const requestParams = {
      ...params,
      limit: 250 // Shopify's max limit
    };

    const response = await this.makeRequest(endpoint, requestParams);
    const records = response[endpoint.split('/').pop().replace('.json', '')] || [];
    
    logger.info(`Fetched ${records.length} records from ${endpoint}`);
    return records;
  }

  async syncCustomers() {
    await this.initialize();
    const syncLog = await this.createSyncLog('customers', 'started');

    try {
      logger.info(`Starting customer sync for tenant ${this.tenantId}`);
      
      const customers = await this.getAllRecords('/customers.json');
      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const customerData of customers) {
        try {
          const existingCustomer = await Customer.findOne({
            where: {
              tenantId: this.tenantId,
              shopifyId: customerData.id
            }
          });

          const customerPayload = {
            tenantId: this.tenantId,
            shopifyId: customerData.id,
            email: customerData.email,
            firstName: customerData.first_name,
            lastName: customerData.last_name,
            phone: customerData.phone,
            totalSpent: parseFloat(customerData.total_spent || 0),
            totalOrders: customerData.orders_count || 0,
            acceptsMarketing: customerData.accepts_marketing || false,
            tags: customerData.tags,
            state: customerData.state,
            note: customerData.note,
            createdAt: new Date(customerData.created_at),
            updatedAt: new Date(customerData.updated_at)
          };

          if (existingCustomer) {
            await existingCustomer.update(customerPayload);
            updated++;
          } else {
            await Customer.create(customerPayload);
            created++;
          }
        } catch (error) {
          logger.error('Error processing customer:', {
            customerId: customerData.id,
            error: error.message,
            tenantId: this.tenantId
          });
          skipped++;
        }
      }

      await this.updateSyncLog(syncLog.id, 'completed', {
        recordsProcessed: customers.length,
        recordsCreated: created,
        recordsUpdated: updated,
        recordsSkipped: skipped
      });

      logger.info(`Customer sync completed for tenant ${this.tenantId}: ${created} created, ${updated} updated, ${skipped} skipped`);
      return { created, updated, skipped, total: customers.length };

    } catch (error) {
      await this.updateSyncLog(syncLog.id, 'failed', {
        errorMessage: error.message
      });
      throw error;
    }
  }

  async syncProducts() {
    await this.initialize();
    const syncLog = await this.createSyncLog('products', 'started');

    try {
      logger.info(`Starting product sync for tenant ${this.tenantId}`);
      
      const products = await this.getAllRecords('/products.json');
      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const productData of products) {
        try {
          const existingProduct = await Product.findOne({
            where: {
              tenantId: this.tenantId,
              shopifyId: productData.id
            }
          });

          const productPayload = {
            tenantId: this.tenantId,
            shopifyId: productData.id,
            title: productData.title,
            handle: productData.handle,
            description: productData.body_html,
            vendor: productData.vendor,
            productType: productData.product_type,
            tags: productData.tags,
            status: productData.status,
            images: productData.images || [],
            variants: productData.variants || [],
            options: productData.options || [],
            createdAt: new Date(productData.created_at),
            updatedAt: new Date(productData.updated_at)
          };

          if (existingProduct) {
            await existingProduct.update(productPayload);
            updated++;
          } else {
            await Product.create(productPayload);
            created++;
          }
        } catch (error) {
          logger.error('Error processing product:', {
            productId: productData.id,
            error: error.message,
            tenantId: this.tenantId
          });
          skipped++;
        }
      }

      await this.updateSyncLog(syncLog.id, 'completed', {
        recordsProcessed: products.length,
        recordsCreated: created,
        recordsUpdated: updated,
        recordsSkipped: skipped
      });

      logger.info(`Product sync completed for tenant ${this.tenantId}: ${created} created, ${updated} updated, ${skipped} skipped`);
      return { created, updated, skipped, total: products.length };

    } catch (error) {
      await this.updateSyncLog(syncLog.id, 'failed', {
        errorMessage: error.message
      });
      throw error;
    }
  }

  async syncOrders() {
    await this.initialize();
    const syncLog = await this.createSyncLog('orders', 'started');

    try {
      logger.info(`Starting order sync for tenant ${this.tenantId}`);
      
      const orders = await this.getAllRecords('/orders.json');
      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const orderData of orders) {
        try {
          const existingOrder = await Order.findOne({
            where: {
              tenantId: this.tenantId,
              shopifyId: orderData.id
            }
          });

          // Find customer if exists
          let customerId = null;
          if (orderData.customer) {
            const customer = await Customer.findOne({
              where: {
                tenantId: this.tenantId,
                shopifyId: orderData.customer.id
              }
            });
            customerId = customer?.id;
          }

          const orderPayload = {
            tenantId: this.tenantId,
            customerId,
            shopifyId: orderData.id,
            orderNumber: orderData.order_number,
            email: orderData.email,
            financialStatus: orderData.financial_status,
            fulfillmentStatus: orderData.fulfillment_status,
            currency: orderData.currency,
            totalPrice: parseFloat(orderData.total_price || 0),
            subtotalPrice: parseFloat(orderData.subtotal_price || 0),
            totalTax: parseFloat(orderData.total_tax || 0),
            totalDiscounts: parseFloat(orderData.total_discounts || 0),
            totalWeight: parseFloat(orderData.total_weight || 0),
            tags: orderData.tags,
            note: orderData.note,
            processedAt: orderData.processed_at ? new Date(orderData.processed_at) : null,
            cancelledAt: orderData.cancelled_at ? new Date(orderData.cancelled_at) : null,
            closedAt: orderData.closed_at ? new Date(orderData.closed_at) : null,
            createdAt: new Date(orderData.created_at),
            updatedAt: new Date(orderData.updated_at)
          };

          let order;
          if (existingOrder) {
            await existingOrder.update(orderPayload);
            order = existingOrder;
            updated++;
          } else {
            order = await Order.create(orderPayload);
            created++;
          }

          // Sync order items
          await this.syncOrderItems(order.id, orderData.line_items || []);

        } catch (error) {
          logger.error('Error processing order:', {
            orderId: orderData.id,
            error: error.message,
            tenantId: this.tenantId
          });
          skipped++;
        }
      }

      await this.updateSyncLog(syncLog.id, 'completed', {
        recordsProcessed: orders.length,
        recordsCreated: created,
        recordsUpdated: updated,
        recordsSkipped: skipped
      });

      logger.info(`Order sync completed for tenant ${this.tenantId}: ${created} created, ${updated} updated, ${skipped} skipped`);
      return { created, updated, skipped, total: orders.length };

    } catch (error) {
      await this.updateSyncLog(syncLog.id, 'failed', {
        errorMessage: error.message
      });
      throw error;
    }
  }

  async syncOrderItems(orderId, lineItems) {
    // Delete existing order items
    await OrderItem.destroy({
      where: { orderId }
    });

    for (const itemData of lineItems) {
      try {
        // Find product if exists
        let productId = null;
        if (itemData.product_id) {
          const product = await Product.findOne({
            where: {
              tenantId: this.tenantId,
              shopifyId: itemData.product_id
            }
          });
          productId = product?.id;
        }

        await OrderItem.create({
          orderId,
          productId,
          shopifyVariantId: itemData.variant_id,
          title: itemData.title,
          variantTitle: itemData.variant_title,
          sku: itemData.sku,
          vendor: itemData.vendor,
          quantity: itemData.quantity,
          price: parseFloat(itemData.price || 0),
          totalDiscount: parseFloat(itemData.total_discount || 0),
          fulfillableQuantity: itemData.fulfillable_quantity,
          fulfillmentStatus: itemData.fulfillment_status,
          requiresShipping: itemData.requires_shipping,
          taxable: itemData.taxable,
          giftCard: itemData.gift_card,
          properties: itemData.properties || []
        });
      } catch (error) {
        logger.error('Error processing order item:', {
          orderId,
          itemId: itemData.id,
          error: error.message,
          tenantId: this.tenantId
        });
      }
    }
  }

  async createSyncLog(syncType, status) {
    return await SyncLog.create({
      tenantId: this.tenantId,
      syncType,
      status,
      startedAt: new Date()
    });
  }

  async updateSyncLog(syncLogId, status, data = {}) {
    const updateData = {
      status,
      completedAt: new Date()
    };

    if (status === 'completed' || status === 'failed') {
      const syncLog = await SyncLog.findByPk(syncLogId);
      const duration = new Date() - new Date(syncLog.startedAt);
      updateData.duration = duration;
    }

    return await SyncLog.update(
      { ...updateData, ...data },
      { where: { id: syncLogId } }
    );
  }

  async fullSync() {
    await this.initialize();
    const syncLog = await this.createSyncLog('full', 'started');

    try {
      logger.info(`Starting full sync for tenant ${this.tenantId}`);
      
      const results = {
        customers: await this.syncCustomers(),
        products: await this.syncProducts(),
        orders: await this.syncOrders()
      };

      // Update tenant last sync time
      await this.tenant.update({
        lastSyncAt: new Date()
      });

      await this.updateSyncLog(syncLog.id, 'completed', {
        recordsProcessed: Object.values(results).reduce((sum, result) => sum + result.total, 0),
        recordsCreated: Object.values(results).reduce((sum, result) => sum + result.created, 0),
        recordsUpdated: Object.values(results).reduce((sum, result) => sum + result.updated, 0),
        recordsSkipped: Object.values(results).reduce((sum, result) => sum + result.skipped, 0)
      });

      logger.info(`Full sync completed for tenant ${this.tenantId}`);
      return results;

    } catch (error) {
      await this.updateSyncLog(syncLog.id, 'failed', {
        errorMessage: error.message
      });
      throw error;
    }
  }
}

module.exports = ShopifyService;
