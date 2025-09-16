const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

// Import models
const Tenant = require('./Tenant')(sequelize, Sequelize.DataTypes);
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Customer = require('./Customer')(sequelize, Sequelize.DataTypes);
const Product = require('./Product')(sequelize, Sequelize.DataTypes);
const Order = require('./Order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./OrderItem')(sequelize, Sequelize.DataTypes);
const SyncLog = require('./SyncLog')(sequelize, Sequelize.DataTypes);

// Define associations
const models = {
  Tenant,
  User,
  Customer,
  Product,
  Order,
  OrderItem,
  SyncLog,
  sequelize,
  Sequelize
};

// Tenant associations
Tenant.hasMany(User, { foreignKey: 'tenantId', as: 'users' });
Tenant.hasMany(Customer, { foreignKey: 'tenantId', as: 'customers' });
Tenant.hasMany(Product, { foreignKey: 'tenantId', as: 'products' });
Tenant.hasMany(Order, { foreignKey: 'tenantId', as: 'orders' });
Tenant.hasMany(SyncLog, { foreignKey: 'tenantId', as: 'syncLogs' });

// User associations
User.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

// Customer associations
Customer.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });

// Product associations
Product.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// Order associations
Order.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'orderItems' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// SyncLog associations
SyncLog.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });

module.exports = models;
