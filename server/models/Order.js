module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
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
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'customer_id',
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    shopifyId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'shopify_id'
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'order_number'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    financialStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'financial_status'
    },
    fulfillmentStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'fulfillment_status'
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_price'
    },
    subtotalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'subtotal_price'
    },
    totalTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'total_tax'
    },
    totalDiscounts: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'total_discounts'
    },
    totalWeight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: 'total_weight'
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'processed_at'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancelled_at'
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'closed_at'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'orders',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['tenant_id', 'shopify_id']
      },
      {
        fields: ['tenant_id']
      },
      {
        fields: ['customer_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Order;
};
