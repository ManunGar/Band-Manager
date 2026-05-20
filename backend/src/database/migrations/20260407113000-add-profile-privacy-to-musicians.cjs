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

    try {
      await queryInterface.removeColumn('Musicians', 'isProfilePrivate');
    } catch (error) {
      // Workaround for MariaDB + Sequelize issue where removeColumn may throw
      // "Cannot delete property 'meta' of [object Array]" after ALTER execution.
      if (!String(error?.message || '').includes("Cannot delete property 'meta'")) {
        throw error;
      }

      const refreshedTableDefinition = await queryInterface.describeTable('Musicians');
      if (refreshedTableDefinition.isProfilePrivate) {
        await queryInterface.sequelize.query('ALTER TABLE `Musicians` DROP COLUMN `isProfilePrivate`', {
          raw: true
        });
      }
    }
  }
};
