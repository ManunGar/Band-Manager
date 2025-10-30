'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('ComponentInstruments', [
      {
        componentId: 1,
        instrumentId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 2,
        instrumentId: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('ComponentInstruments', null, {});
  }
};
