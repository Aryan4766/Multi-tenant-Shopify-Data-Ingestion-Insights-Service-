module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id'
      }
    },
    shopifyVariantId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'shopify_variant_id'
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    variantTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'variant_title'
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    vendor: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    totalDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'total_discount'
    },
    fulfillableQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'fulfillable_quantity'
    },
    fulfillmentStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'fulfillment_status'
    },
    requiresShipping: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'requires_shipping'
    },
    taxable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    giftCard: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'gift_card'
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    }
  }, {
    tableName: 'order_items',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['product_id']
      },
      {
        fields: ['shopify_variant_id']
      }
    ]
  });

  return OrderItem;
};
