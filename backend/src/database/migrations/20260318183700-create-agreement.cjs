'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Agreements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      performanceId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Performances',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      musicianId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Musicians',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      instrumentId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Instruments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      payment: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Agreements');
  }
};