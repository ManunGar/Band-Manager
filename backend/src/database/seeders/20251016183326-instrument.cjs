'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Instruments', [
      {
        name: 'Dirección Musical',
        image: '/public/instruments/director.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Piano',
        image: '/public/instruments/piano.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Flauta',
        image: '/public/instruments/flauta.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Flautín',
        image: '/public/instruments/piccolo.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Oboe',
        image: '/public/instruments/oboe.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clarinete',
        image: '/public/instruments/clarinete.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Corno Inglés',
        image: '/public/instruments/clarinete.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Requinto',
        image: '/public/instruments/clarinete.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Clarinete bajo',
        image: '/public/instruments/clarinete-bajo.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Violín',
        image: '/public/instruments/violin.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Viola',
        image: '/public/instruments/violin.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Violonchelo',
        image: '/public/instruments/violonchelo.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saxofón alto',
        image: '/public/instruments/saxofon.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saxofón soprano',
        image: '/public/instruments/saxofon.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saxofón tenor',
        image: '/public/instruments/saxofon.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Saxofón barítono',
        image: '/public/instruments/saxofon.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fagot',
        image: '/public/instruments/fagot.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Contrafagot',
        image: '/public/instruments/fagot.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trompa',
        image: '/public/instruments/trompa.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trombón',
        image: '/public/instruments/trombon.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tuba',
        image: '/public/instruments/tuba.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bombardino',
        image: '/public/instruments/bombardino.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trompeta',
        image: '/public/instruments/trompeta.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fliscorno',
        image: '/public/instruments/trompeta.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Corneta',
        image: '/public/instruments/corneta.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        name: 'Percusión',
        image: '/public/instruments/percusion.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tambor',
        image: '/public/instruments/tambor.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bombo',
        image: '/public/instruments/bombo.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Instruments', null, {});
  }
};
