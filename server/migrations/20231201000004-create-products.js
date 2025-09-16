'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
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
      shopify_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      handle: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendor: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      product_type: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      tags: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'archived', 'draft'),
        defaultValue: 'active'
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      variants: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      options: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
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

    await queryInterface.addIndex('products', ['tenant_id', 'shopify_id'], {
      unique: true,
      name: 'products_tenant_shopify_unique'
    });

    await queryInterface.addIndex('products', ['tenant_id'], {
      name: 'products_tenant_id_index'
    });

    await queryInterface.addIndex('products', ['handle'], {
      name: 'products_handle_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
