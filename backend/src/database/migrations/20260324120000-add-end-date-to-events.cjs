'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
    await queryInterface.removeColumn('Events', 'endDate');
  }
};
