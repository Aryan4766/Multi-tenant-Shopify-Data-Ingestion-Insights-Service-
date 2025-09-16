'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      shopify_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      financial_status: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      fulfillment_status: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: true
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      total_tax: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      total_discounts: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      total_weight: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      tags: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      closed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('orders', ['tenant_id', 'shopify_id'], {
      unique: true,
      name: 'orders_tenant_shopify_unique'
    });

    await queryInterface.addIndex('orders', ['tenant_id'], {
      name: 'orders_tenant_id_index'
    });

    await queryInterface.addIndex('orders', ['customer_id'], {
      name: 'orders_customer_id_index'
    });

    await queryInterface.addIndex('orders', ['created_at'], {
      name: 'orders_created_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};
