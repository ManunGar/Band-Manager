'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('ComponentInstruments', [
      // Component 1: Javier en Banda 1 - Director y Trompeta
      {
        componentId: 1,
        instrumentId: 1, // Dirección Musical
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 1,
        instrumentId: 23, // Trompeta
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 2: Javier en Banda 2 - Trompeta y Fliscorno
      {
        componentId: 2,
        instrumentId: 23, // Trompeta
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 2,
        instrumentId: 24, // Fliscorno
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 3: Carlos en Banda 1 - Saxofones
      {
        componentId: 3,
        instrumentId: 13, // Saxofón alto
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 3,
        instrumentId: 15, // Saxofón tenor
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 4: Antonio en Banda 1 - Tuba
      {
        componentId: 4,
        instrumentId: 21, // Tuba
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 5: Antonio en Banda 3 - Tuba
      {
        componentId: 5,
        instrumentId: 21, // Tuba
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 6: Francisco en Banda 2 - Director y Percusión
      {
        componentId: 6,
        instrumentId: 1, // Dirección Musical
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 6,
        instrumentId: 26, // Percusión
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 7: Miguel en Banda 2 - Trombón y Bombardino
      {
        componentId: 7,
        instrumentId: 20, // Trombón
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 7,
        instrumentId: 22, // Bombardino
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 8: María en Banda 1 - Flauta y Flautín
      {
        componentId: 8,
        instrumentId: 3, // Flauta
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 8,
        instrumentId: 4, // Flautín
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 9: María en Banda 2 - Flauta
      {
        componentId: 9,
        instrumentId: 3, // Flauta
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 10: Carmen en Banda 3 - Directora y Clarinete
      {
        componentId: 10,
        instrumentId: 1, // Dirección Musical
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 10,
        instrumentId: 6, // Clarinete
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 11: Isabel en Banda 3 - Trompa
      {
        componentId: 11,
        instrumentId: 19, // Trompa
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 12: Laura en Banda 2 - Corneta y Trompeta
      {
        componentId: 12,
        instrumentId: 25, // Corneta
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 12,
        instrumentId: 23, // Trompeta
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 13: Laura en Banda 3 - Corneta
      {
        componentId: 13,
        instrumentId: 25, // Corneta
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Component 14: Elena en Banda 1 - Saxofón barítono y Clarinete bajo
      {
        componentId: 14,
        instrumentId: 16, // Saxofón barítono
        principal: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        componentId: 14,
        instrumentId: 9, // Clarinete bajo
        principal: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('ComponentInstruments', null, {});
  }
};
