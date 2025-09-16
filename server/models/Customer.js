module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
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
    shopifyId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'shopify_id'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'last_name'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    totalSpent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_spent'
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_orders'
    },
    acceptsMarketing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'accepts_marketing'
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'customers',
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
        fields: ['email']
      }
    ]
  });

  return Customer;
};
