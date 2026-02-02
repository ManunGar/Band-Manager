'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('InstrumentAttendances', [
      // ========== Event 2: Cabalgata de Reyes (Banda 1) - Solo metales y percusión ==========
      {
        eventId: 2,
        instrumentId: 17, // Trompeta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 18, // Fliscorno
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 19, // Corneta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 14, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 15, // Tuba
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 16, // Bombardino
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 20, // Percusión
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 21, // Tambor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        instrumentId: 22, // Bombo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 9: Pasacalles (Banda 2) - Solo metales y percusión ==========
      {
        eventId: 9,
        instrumentId: 17, // Trompeta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 18, // Fliscorno
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 19, // Corneta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 13, // Trompa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 14, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 16, // Bombardino
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 20, // Percusión
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        instrumentId: 21, // Tambor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 17: Misa del Gallo (Banda 3) - Solo instrumentos suaves ==========
      {
        eventId: 17,
        instrumentId: 2, // Flauta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        instrumentId: 4, // Oboe
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        instrumentId: 5, // Clarinete
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        instrumentId: 13, // Trompa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        instrumentId: 14, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 19: Día de Andalucía Pasacalles (Banda 3) - Metales y percusión ==========
      {
        eventId: 19,
        instrumentId: 17, // Trompeta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 19, // Corneta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 13, // Trompa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 14, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 15, // Tuba
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 20, // Percusión
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 21, // Tambor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        instrumentId: 22, // Bombo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 5: Ensayo parcial Banda 1 - Solo maderas ==========
      {
        eventId: 5,
        instrumentId: 2, // Flauta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 3, // Flautín
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 4, // Oboe
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 5, // Clarinete
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 7, // Clarinete bajo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 8, // Saxofón alto
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 10, // Saxofón tenor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        instrumentId: 11, // Saxofón barítono
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 14: Ensayo parcial Banda 2 - Solo metales ==========
      {
        eventId: 14,
        instrumentId: 17, // Trompeta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 18, // Fliscorno
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 19, // Corneta
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 13, // Trompa
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 14, // Trombón
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 16, // Bombardino
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        instrumentId: 15, // Tuba
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 22: Ensayo parcial Banda 3 - Solo saxofones y clarinetes ==========
      {
        eventId: 22,
        instrumentId: 5, // Clarinete
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 6, // Requinto
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 7, // Clarinete bajo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 8, // Saxofón alto
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 9, // Saxofón soprano
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 10, // Saxofón tenor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 22,
        instrumentId: 11, // Saxofón barítono
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== Event 15: Ensayo parcial Banda 2 - Solo percusión ==========
      {
        eventId: 15,
        instrumentId: 20, // Percusión
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 15,
        instrumentId: 21, // Tambor
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 15,
        instrumentId: 22, // Bombo
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('InstrumentAttendances', null, {});
  }
};
