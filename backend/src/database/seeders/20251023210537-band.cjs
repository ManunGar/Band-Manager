'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Bands', [
      {
        name: 'Banda Municipal de Lora del Río',
        location: 'Lora del Río, Sevilla',
        phone: '955123456',
        type: 'Banda de Música',
        code: 'BMLR001',
        profile_picture: 'https://res.cloudinary.com/dprlzqkhi/image/upload/v1761254715/logoBanda_lp6ri1.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Bands', null, {});
  }
};
