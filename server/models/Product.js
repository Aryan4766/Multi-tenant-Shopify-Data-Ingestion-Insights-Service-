module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
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
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    handle: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    vendor: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    productType: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'product_type'
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'archived', 'draft'),
      defaultValue: 'active'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    variants: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
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
    tableName: 'products',
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
        fields: ['handle']
      }
    ]
  });

  return Product;
};
