'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sync_logs', {
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
      sync_type: {
        type: Sequelize.ENUM('customers', 'products', 'orders', 'full'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('started', 'completed', 'failed'),
        allowNull: false
      },
      records_processed: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      records_created: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      records_updated: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      records_skipped: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      started_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Duration in milliseconds'
      }
    });

    await queryInterface.addIndex('sync_logs', ['tenant_id'], {
      name: 'sync_logs_tenant_id_index'
    });

    await queryInterface.addIndex('sync_logs', ['sync_type'], {
      name: 'sync_logs_sync_type_index'
    });

    await queryInterface.addIndex('sync_logs', ['status'], {
      name: 'sync_logs_status_index'
    });

    await queryInterface.addIndex('sync_logs', ['started_at'], {
      name: 'sync_logs_started_at_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sync_logs');
  }
};
