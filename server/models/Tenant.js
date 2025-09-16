module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    shopifyDomain: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'shopify_domain'
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'access_token'
    },
    webhookSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'webhook_secret'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    lastSyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_sync_at'
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'tenants',
    timestamps: true,
    underscored: true,
    indexes: []
  });

  return Tenant;
};
