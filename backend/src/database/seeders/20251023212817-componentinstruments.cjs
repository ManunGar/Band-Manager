'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('ComponentInstruments', [
      {
        componentId: 1,
        instrumentId: 5,
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 1,
        instrumentId: 6,
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 2,
        instrumentId: 8,
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('ComponentInstruments', null, {});
  }
};
