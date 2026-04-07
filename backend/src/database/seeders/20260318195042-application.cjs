'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Applications', [
      // Agreement 1 asks for Tuba (instrumentId 21)
      {
        musicianId: 3, // has Tuba
        agreementId: 1,
        status: 'accepted',
        rate: 4.5,
        type: 'musician_apply',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Agreement 2 asks for Saxofon baritono (instrumentId 16)
      {
        musicianId: 10, // has Saxofon baritono
        agreementId: 2,
        status: 'pending',
        type: 'musician_apply',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Agreement 3 asks for Trompa (instrumentId 19)
      {
        musicianId: 8, // has Trompa
        agreementId: 3,
        status: 'accepted',
        type: 'band_invite',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Agreement 4 asks for Trompeta (instrumentId 23)
      {
        musicianId: 9, // has Trompeta
        agreementId: 4,
        status: 'pending',
        type: 'musician_apply',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 7, // has Trompeta
        agreementId: 4,
        status: 'rejected',
        type: 'musician_apply',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Agreement 5 asks for Oboe (instrumentId 5)
      {
        musicianId: 6, // has Oboe
        agreementId: 5,
        status: 'accepted',
        type: 'band_invite',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Agreement 6 asks for Bombardino (instrumentId 22)
      {
        musicianId: 5, // has Bombardino
        agreementId: 6,
        status: 'pending',
        type: 'musician_apply',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Agreement 7 asks for Fagot (instrumentId 17)
      {
        musicianId: 10, // has Fagot
        agreementId: 7,
        status: 'accepted',
        rate: 4,
        type: 'musician_apply',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Agreement 8 asks for Tambor (instrumentId 27)
      {
        musicianId: 4, // has Tambor
        agreementId: 8,
        status: 'accepted',
        type: 'band_invite',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Agreement 9 asks for Clarinete (instrumentId 6)
      {
        musicianId: 1, // has Clarinete
        agreementId: 9,
        status: 'pending',
        type: 'musician_apply',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 2, // has Clarinete
        agreementId: 9,
        status: 'accepted',
        type: 'musician_apply',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Applications', null, {});
  }
};
