'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Instruments', [
      {
        name: 'Dirección Musical',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Flauta',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Piccolo',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Oboe',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clarinete',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Requinto',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clarinete bajo',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saxofón alto',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saxofón soprano',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saxofón tenor',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saxofón barítono',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fagot',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trompa',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trombón',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tuba',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bombardino',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trompeta',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Corneta',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'Percusión',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tambor',
        image: '/example',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Instruments', null, {});
  }
};
