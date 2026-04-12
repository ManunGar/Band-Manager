'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Agreements', [
      // ================= BAND 1 (admins: musician 1, 2) =================
      {
        performanceId: 1, // Event 1 -> Band 1
        musicianId: 1,
        instrumentId: 21, // Tuba
        status: 'closed',
        amount: 1,
        payment: 180,
        description: 'Se busca tuba para refuerzo en concierto de Navidad',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 3, // Event 3 -> Band 1
        musicianId: 2,
        instrumentId: 16, // Saxofon baritono
        status: 'open',
        amount: 1,
        payment: 150,
        description: 'Refuerzo de saxofon baritono para repertorio romantico',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 4, // Event 4 -> Band 1
        musicianId: 1,
        instrumentId: 19, // Trompa
        status: 'closed',
        amount: 1,
        payment: 170,
        description: 'Sustitución de trompa para concierto de Semana Santa',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ================= BAND 2 (admin: musician 4) =================
      {
        performanceId: 6, // Event 9 -> Band 2
        musicianId: 4,
        instrumentId: 23, // Trompeta
        status: 'open',
        amount: 2,
        payment: 140,
        description: 'Se necesitan dos trompetas para pasacalles',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 8, // Event 11 -> Band 2
        musicianId: 4,
        instrumentId: 5, // Oboe
        status: 'closed',
        amount: 1,
        payment: 160,
        description: 'Refuerzo de oboe para concierto de primavera',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 9, // Event 12 -> Band 2
        musicianId: 4,
        instrumentId: 22, // Bombardino
        status: 'open',
        amount: 1,
        payment: 155,
        description: 'Se busca bombardino para feria patronal',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ================= BAND 3 (admin: musician 7) =================
      {
        performanceId: 10, // Event 17 -> Band 3
        musicianId: 7,
        instrumentId: 17, // Fagot
        status: 'closed',
        amount: 1,
        payment: 190,
        description: 'Fagot para misa del gallo y repertorio sacro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 12, // Event 19 -> Band 3
        musicianId: 7,
        instrumentId: 27, // Tambor
        status: 'closed',
        amount: 1,
        payment: 130,
        description: 'Tambor para pasacalles del Dia de Andalucia',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 14, // Event 21 -> Band 3
        musicianId: 7,
        instrumentId: 6, // Clarinete
        status: 'open',
        amount: 2,
        payment: 165,
        description: 'Dos clarinetes para concierto de verano',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 11, // Event 18 -> Band 3
        musicianId: 7,
        instrumentId: 6, // Clarinete
        status: 'closed',
        amount: 1,
        payment: 160,
        description: 'Refuerzo de clarinete para concierto extraordinario',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 11, // Event 18 -> Band 3
        musicianId: 7,
        instrumentId: 8, // Requinto
        status: 'closed',
        amount: 1,
        payment: 170,
        description: 'Requinto solista para repertorio clasico y popular',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 13, // Event 20 -> Band 3
        musicianId: 7,
        instrumentId: 6, // Clarinete
        status: 'open',
        amount: 2,
        payment: 155,
        description: 'Dos clarinetes para procesion de Semana Santa',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 14, // Event 21 -> Band 3
        musicianId: 7,
        instrumentId: 8, // Requinto
        status: 'open',
        amount: 1,
        payment: 175,
        description: 'Requinto principal para pasodobles en concierto de verano',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        performanceId: 14, // Event 21 -> Band 3
        musicianId: 7,
        instrumentId: 6, // Clarinete
        status: 'open',
        amount: 1,
        payment: 162,
        description: 'Clarinete de refuerzo para cuerda de maderas',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Agreements', null, {});
  }
};
