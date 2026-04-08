'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDefinition = await queryInterface.describeTable('Events');

    if (tableDefinition.endDate) {
      return;
    }

    await queryInterface.addColumn('Events', 'endDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.sequelize.query('UPDATE `Events` SET `endDate` = `date` WHERE `endDate` IS NULL');

    await queryInterface.changeColumn('Events', 'endDate', {
      type: Sequelize.DATE,
      allowNull: false
    });
  },

  async down(queryInterface) {
    const tableDefinition = await queryInterface.describeTable('Events');

    if (!tableDefinition.endDate) {
      return;
    }

    try {
      await queryInterface.removeColumn('Events', 'endDate');
    } catch (error) {
      // Workaround for MariaDB + Sequelize issue where removeColumn may throw
      // "Cannot delete property 'meta' of [object Array]" after ALTER execution.
      if (!String(error?.message || '').includes("Cannot delete property 'meta'")) {
        throw error;
      }

      const refreshedTableDefinition = await queryInterface.describeTable('Events');
      if (refreshedTableDefinition.endDate) {
        await queryInterface.sequelize.query('ALTER TABLE `Events` DROP COLUMN `endDate`', { raw: true });
      }
    }
  }
};
