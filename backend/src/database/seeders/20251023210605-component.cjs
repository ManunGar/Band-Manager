'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Components', [
      {
        musicianId: 1,
        bandId: 1,
        private: false,
        administrator: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 2,
        bandId: 2,
        private: true,
        administrator: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Components', null, {});
  }
};
