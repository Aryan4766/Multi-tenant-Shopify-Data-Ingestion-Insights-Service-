const cron = require('node-cron');
const { Tenant } = require('../models');
const ShopifyService = require('./shopifyService');
const logger = require('../utils/logger');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  async startScheduler() {
    logger.info('Starting scheduler service');

    // Schedule full sync every 6 hours for active tenants
    cron.schedule('0 */6 * * *', async () => {
      await this.runScheduledSync('full');
    });

    // Schedule order sync every hour for active tenants
    cron.schedule('0 * * * *', async () => {
      await this.runScheduledSync('orders');
    });

    // Schedule customer and product sync every 12 hours
    cron.schedule('0 */12 * * *', async () => {
      await this.runScheduledSync('customers');
      await this.runScheduledSync('products');
    });

    logger.info('Scheduler service started successfully');
  }

  async runScheduledSync(syncType) {
    try {
      logger.info(`Starting scheduled ${syncType} sync`);

      const activeTenants = await Tenant.findAll({
        where: { isActive: true }
      });

      for (const tenant of activeTenants) {
        try {
          const shopifyService = new ShopifyService(tenant.id);
          
          switch (syncType) {
            case 'customers':
              await shopifyService.syncCustomers();
              break;
            case 'products':
              await shopifyService.syncProducts();
              break;
            case 'orders':
              await shopifyService.syncOrders();
              break;
            case 'full':
              await shopifyService.fullSync();
              break;
          }

          logger.info(`Scheduled ${syncType} sync completed for tenant ${tenant.id}`);
        } catch (error) {
          logger.error(`Scheduled ${syncType} sync failed for tenant ${tenant.id}:`, error);
        }
      }

      logger.info(`Scheduled ${syncType} sync completed for all tenants`);
    } catch (error) {
      logger.error(`Scheduled ${syncType} sync error:`, error);
    }
  }

  async startTenantSync(tenantId, syncType, interval = '0 */6 * * *') {
    const jobId = `${tenantId}-${syncType}`;
    
    if (this.jobs.has(jobId)) {
      this.stopTenantSync(tenantId, syncType);
    }

    const job = cron.schedule(interval, async () => {
      try {
        const shopifyService = new ShopifyService(tenantId);
        
        switch (syncType) {
          case 'customers':
            await shopifyService.syncCustomers();
            break;
          case 'products':
            await shopifyService.syncProducts();
            break;
          case 'orders':
            await shopifyService.syncOrders();
            break;
          case 'full':
            await shopifyService.fullSync();
            break;
        }

        logger.info(`Custom ${syncType} sync completed for tenant ${tenantId}`);
      } catch (error) {
        logger.error(`Custom ${syncType} sync failed for tenant ${tenantId}:`, error);
      }
    });

    this.jobs.set(jobId, job);
    logger.info(`Started custom ${syncType} sync for tenant ${tenantId} with interval ${interval}`);
  }

  stopTenantSync(tenantId, syncType) {
    const jobId = `${tenantId}-${syncType}`;
    const job = this.jobs.get(jobId);
    
    if (job) {
      job.stop();
      this.jobs.delete(jobId);
      logger.info(`Stopped custom ${syncType} sync for tenant ${tenantId}`);
    }
  }

  stopAllTenantSyncs(tenantId) {
    const tenantJobs = Array.from(this.jobs.keys()).filter(key => key.startsWith(`${tenantId}-`));
    
    tenantJobs.forEach(jobId => {
      const job = this.jobs.get(jobId);
      if (job) {
        job.stop();
        this.jobs.delete(jobId);
      }
    });

    logger.info(`Stopped all custom syncs for tenant ${tenantId}`);
  }

  getActiveJobs() {
    return Array.from(this.jobs.keys());
  }
}

module.exports = new SchedulerService();
