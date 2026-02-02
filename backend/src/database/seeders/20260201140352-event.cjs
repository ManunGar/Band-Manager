'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Events', [
      // ========== BANDA 1: Banda Municipal de Lora del Río ==========
      
      // Actuaciones Banda 1
      {
        bandId: 1,
        date: '2025-12-15',
        initialTime: '19:00:00',
        endTime: '21:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2026-01-05',
        initialTime: '12:00:00',
        endTime: '13:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2027-02-14',
        initialTime: '20:00:00',
        endTime: '22:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2027-03-28',
        initialTime: '18:30:00',
        endTime: '20:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ensayos Banda 1
      {
        bandId: 1,
        date: '2025-12-10',
        initialTime: '20:00:00',
        endTime: '22:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2026-01-28',
        initialTime: '20:00:00',
        endTime: '22:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2027-02-11',
        initialTime: '20:00:00',
        endTime: '22:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== BANDA 2: Banda La Oliva de Salteras ==========
      
      // Actuaciones Banda 2
      {
        bandId: 2,
        date: '2025-11-20',
        initialTime: '19:30:00',
        endTime: '21:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2026-01-18',
        initialTime: '13:00:00',
        endTime: '14:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-02-22',
        initialTime: '12:00:00',
        endTime: '14:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-04-05',
        initialTime: '19:00:00',
        endTime: '21:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-05-15',
        initialTime: '20:00:00',
        endTime: '22:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ensayos Banda 2
      {
        bandId: 2,
        date: '2026-01-15',
        initialTime: '19:30:00',
        endTime: '21:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-02-05',
        initialTime: '19:30:00',
        endTime: '21:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-02-19',
        initialTime: '19:30:00',
        endTime: '21:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-04-02',
        initialTime: '19:30:00',
        endTime: '21:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== BANDA 3: AMC Cazalla de la Sierra ==========
      
      // Actuaciones Banda 3
      {
        bandId: 3,
        date: '2025-12-24',
        initialTime: '23:00:00',
        endTime: '00:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2026-01-12',
        initialTime: '18:00:00',
        endTime: '19:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-03-15',
        initialTime: '12:30:00',
        endTime: '14:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-04-19',
        initialTime: '11:00:00',
        endTime: '13:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-06-07',
        initialTime: '21:00:00',
        endTime: '23:00:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ensayos Banda 3
      {
        bandId: 3,
        date: '2025-12-20',
        initialTime: '20:30:00',
        endTime: '22:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-02-08',
        initialTime: '20:30:00',
        endTime: '22:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-03-12',
        initialTime: '20:30:00',
        endTime: '22:30:00',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Events', null, {});
  }
};
