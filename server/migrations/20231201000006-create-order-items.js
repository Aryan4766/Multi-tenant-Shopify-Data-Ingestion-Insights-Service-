'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      shopify_variant_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      variant_title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      vendor: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      fulfillable_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      fulfillment_status: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      requires_shipping: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      taxable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      gift_card: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      properties: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      }
    });

    await queryInterface.addIndex('order_items', ['order_id'], {
      name: 'order_items_order_id_index'
    });

    await queryInterface.addIndex('order_items', ['product_id'], {
      name: 'order_items_product_id_index'
    });

    await queryInterface.addIndex('order_items', ['shopify_variant_id'], {
      name: 'order_items_shopify_variant_id_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('order_items');
  }
};
