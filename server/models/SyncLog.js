module.exports = (sequelize, DataTypes) => {
  const SyncLog = sequelize.define('SyncLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenant_id',
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    syncType: {
      type: DataTypes.ENUM('customers', 'products', 'orders', 'full'),
      allowNull: false,
      field: 'sync_type'
    },
    status: {
      type: DataTypes.ENUM('started', 'completed', 'failed'),
      allowNull: false
    },
    recordsProcessed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'records_processed'
    },
    recordsCreated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'records_created'
    },
    recordsUpdated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'records_updated'
    },
    recordsSkipped: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'records_skipped'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message'
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'started_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_at'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in milliseconds'
    }
  }, {
    tableName: 'sync_logs',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['tenant_id']
      },
      {
        fields: ['sync_type']
      },
      {
        fields: ['status']
      },
      {
        fields: ['started_at']
      }
    ]
  });

  return SyncLog;
};
