'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Rehearsals', [
      // ========== ENSAYOS BANDA 1: Banda Municipal de Lora del Río ==========
      
      {
        eventId: 5, // 10/12/2025 - Ensayo previo al concierto de Navidad
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 6, // 28/01/2026 - Ensayo general
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 7, // 11/02/2027 - Ensayo preparatorio para San Valentín
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== ENSAYOS BANDA 2: Banda La Oliva de Salteras ==========
      
      {
        eventId: 13, // 15/01/2026 - Ensayo semanal
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14, // 05/02/2027 - Ensayo para Carnaval
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 15, // 19/02/2027 - Ensayo semanal
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 16, // 02/04/2027 - Ensayo preparatorio para Concierto de Primavera
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== ENSAYOS BANDA 3: AMC Cazalla de la Sierra ==========
      
      {
        eventId: 22, // 20/12/2025 - Ensayo previo a Misa del Gallo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 23, // 08/02/2027 - Ensayo general
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 24, // 12/03/2027 - Ensayo preparatorio para Día de Andalucía
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Rehearsals', null, {});
  }
};
