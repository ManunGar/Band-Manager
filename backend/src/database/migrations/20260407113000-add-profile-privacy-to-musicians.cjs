'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('Musicians');

    if (tableDefinition.isProfilePrivate) {
      return;
    }

    await queryInterface.addColumn('Musicians', 'isProfilePrivate', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down(queryInterface) {
    const tableDefinition = await queryInterface.describeTable('Musicians');

    if (!tableDefinition.isProfilePrivate) {
      return;
    }

    await queryInterface.removeColumn('Musicians', 'isProfilePrivate');
  }
};
