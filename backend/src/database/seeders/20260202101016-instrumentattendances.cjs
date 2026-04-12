'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('InstrumentAttendances', [
      // ========== Event 2: Cabalgata de Reyes (Banda 1) - Solo metales y percusión ==========
      {
        eventId: 2,
        instrumentId: 23, // Trompeta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 24, // Fliscorno
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 25, // Corneta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 20, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 21, // Tuba
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 22, // Bombardino
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 26, // Percusión
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 27, // Tambor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 28, // Bombo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 9: Pasacalles (Banda 2) - Solo metales y percusión ==========
      {
        eventId: 9,
        instrumentId: 23, // Trompeta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 24, // Fliscorno
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 25, // Corneta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 19, // Trompa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 20, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 22, // Bombardino
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 26, // Percusión
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 27, // Tambor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 17: Misa del Gallo (Banda 3) - Solo instrumentos suaves ==========
      {
        eventId: 17,
        instrumentId: 3, // Flauta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        instrumentId: 5, // Oboe
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        instrumentId: 6, // Clarinete
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        instrumentId: 19, // Trompa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        instrumentId: 20, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 19: Día de Andalucía Pasacalles (Banda 3) - Metales y percusión ==========
      {
        eventId: 19,
        instrumentId: 23, // Trompeta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 25, // Corneta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 19, // Trompa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 20, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 21, // Tuba
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 26, // Percusión
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 27, // Tambor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 28, // Bombo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 5: Ensayo parcial Banda 1 - Solo maderas ==========
      {
        eventId: 5,
        instrumentId: 3, // Flauta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 4, // Flautín
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 5, // Oboe
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 6, // Clarinete
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 9, // Clarinete bajo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 13, // Saxofón alto
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 15, // Saxofón tenor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 16, // Saxofón barítono
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 14: Ensayo parcial Banda 2 - Solo metales ==========
      {
        eventId: 14,
        instrumentId: 23, // Trompeta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 24, // Fliscorno
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 25, // Corneta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 19, // Trompa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 20, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 22, // Bombardino
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 21, // Tuba
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 22: Ensayo parcial Banda 3 - Solo saxofones y clarinetes ==========
      {
        eventId: 22,
        instrumentId: 6, // Clarinete
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 8, // Requinto
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 9, // Clarinete bajo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 13, // Saxofón alto
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 14, // Saxofón soprano
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 15, // Saxofón tenor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 16, // Saxofón barítono
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 15: Ensayo parcial Banda 2 - Solo percusión ==========
      {
        eventId: 15,
        instrumentId: 26, // Percusión
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 15,
        instrumentId: 27, // Tambor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 15,
        instrumentId: 28, // Bombo
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('InstrumentAttendances', null, {});
  }
};
