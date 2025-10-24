'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     return queryInterface.bulkInsert('MusicianLevels', [
      {
        musicianId: 1,
        instrumentId: 5,
        level: 'título profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 1,
        instrumentId: 6,
        level: 'aficionado profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('MusicianLevels', null, {});
  }
};
