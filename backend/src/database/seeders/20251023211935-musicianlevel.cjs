'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     return queryInterface.bulkInsert('MusicianLevels', [
      // Manuel Nuño (Musician 1) - Clarinete y Requinto
      {
        musicianId: 1,
        instrumentId: 5, // Clarinete
        level: 'título profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 1,
        instrumentId: 6, // Requinto
        level: 'aficionado profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Carlos Ruiz (Musician 2) - Saxofón alto, Saxofón tenor y Clarinete
      {
        musicianId: 2,
        instrumentId: 8, // Saxofón alto
        level: 'título profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 2,
        instrumentId: 10, // Saxofón tenor
        level: 'aficionado profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 2,
        instrumentId: 5, // Clarinete
        level: 'enseñanzas básica',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Antonio Jiménez (Musician 3) - Tuba
      {
        musicianId: 3,
        instrumentId: 15, // Tuba
        level: 'título profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Francisco Martín (Musician 4) - Percusión y Tambor
      {
        musicianId: 4,
        instrumentId: 20, // Percusión
        level: 'aficionado profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 4,
        instrumentId: 21, // Tambor
        level: 'título profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Miguel Navarro (Musician 5) - Trombón y Bombardino
      {
        musicianId: 5,
        instrumentId: 14, // Trombón
        level: 'título superior',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 5,
        instrumentId: 16, // Bombardino
        level: 'aficionado profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // María García (Musician 6) - Flauta, Flautín y Oboe
      {
        musicianId: 6,
        instrumentId: 2, // Flauta
        level: 'título superior',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 6,
        instrumentId: 3, // Flautín
        level: 'título profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 6,
        instrumentId: 4, // Oboe
        level: 'enseñanzas básica',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Carmen López (Musician 7) - Trompeta y Fliscorno
      {
        musicianId: 7,
        instrumentId: 17, // Trompeta
        level: 'título superior',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 7,
        instrumentId: 18, // Fliscorno
        level: 'título profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Isabel Sánchez (Musician 8) - Trompa
      {
        musicianId: 8,
        instrumentId: 13, // Trompa
        level: 'título superior',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Laura Fernández (Musician 9) - Corneta y Trompeta
      {
        musicianId: 9,
        instrumentId: 19, // Corneta
        level: 'aficionado profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 9,
        instrumentId: 17, // Trompeta
        level: 'enseñanzas básica',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Elena Torres (Musician 10) - Saxofón barítono, Fagot y Clarinete bajo
      {
        musicianId: 10,
        instrumentId: 11, // Saxofón barítono
        level: 'título profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 10,
        instrumentId: 12, // Fagot
        level: 'aficionado profesional',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 10,
        instrumentId: 7, // Clarinete bajo
        level: 'aficionado',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('MusicianLevels', null, {});
  }
};
