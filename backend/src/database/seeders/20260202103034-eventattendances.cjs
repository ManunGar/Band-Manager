'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('EventAttendances', [
      // ========== EVENT 1: Concierto Navidad Banda 1 (15/12/2025) - PASADO ==========
      {
        eventId: 1,
        componentId: 1, // Javier
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 1,
        componentId: 3, // Carlos
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 1,
        componentId: 4, // Antonio
        present: false,
        alleged: true,
        reason: 'Enfermedad - gripe',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 1,
        componentId: 8, // María
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 1,
        componentId: 14, // Elena
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 2: Cabalgata Reyes Banda 1 (05/01/2026) - PASADO ==========
      {
        eventId: 2,
        componentId: 1, // Javier
        present: true,
        alleged: null,
        reason: 'Llegué 10 min tarde',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        componentId: 3, // Carlos
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        componentId: 4, // Antonio
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        componentId: 8, // María
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        componentId: 14, // Elena
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 5: Ensayo Banda 1 (10/12/2025) - PASADO - Solo maderas ==========
      {
        eventId: 5,
        componentId: 8, // María - Flauta
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        componentId: 14, // Elena - Saxofón barítono
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 5,
        componentId: 3, // Carlos - Saxofón alto
        present: false,
        alleged: false,
        reason: 'No avisó',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 6: Ensayo Banda 1 (28/01/2026) - PASADO ==========
      {
        eventId: 6,
        componentId: 1, // Javier
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 6,
        componentId: 3, // Carlos
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 6,
        componentId: 4, // Antonio
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 6,
        componentId: 8, // María
        present: false,
        alleged: true,
        reason: 'Trabajo - turno de tarde',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 6,
        componentId: 14, // Elena
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 8: Santa Cecilia Banda 2 (20/11/2025) - PASADO ==========
      {
        eventId: 8,
        componentId: 2, // Javier
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 8,
        componentId: 6, // Francisco
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 8,
        componentId: 7, // Miguel
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 8,
        componentId: 9, // María
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 8,
        componentId: 12, // Laura
        present: false,
        alleged: true,
        reason: 'Viaje familiar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 9: Pasacalles Banda 2 (18/01/2026) - PASADO ==========
      {
        eventId: 9,
        componentId: 2, // Javier
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        componentId: 6, // Francisco
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        componentId: 7, // Miguel
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        componentId: 12, // Laura
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 13: Ensayo Banda 2 (15/01/2026) - PASADO ==========
      {
        eventId: 13,
        componentId: 2, // Javier
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 13,
        componentId: 6, // Francisco
        present: false,
        alleged: true,
        reason: 'Médico - revisión programada',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 13,
        componentId: 7, // Miguel
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 13,
        componentId: 9, // María
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 13,
        componentId: 12, // Laura
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 17: Misa del Gallo Banda 3 (24/12/2025) - PASADO ==========
      {
        eventId: 17,
        componentId: 5, // Antonio
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        componentId: 10, // Carmen
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        componentId: 11, // Isabel
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 17,
        componentId: 13, // Laura
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 18: Año Nuevo Banda 3 (12/01/2026) - PASADO ==========
      {
        eventId: 18,
        componentId: 5, // Antonio
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 18,
        componentId: 10, // Carmen
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 18,
        componentId: 11, // Isabel
        present: false,
        alleged: false,
        reason: 'No pudo asistir',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 18,
        componentId: 13, // Laura
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 22: Ensayo Banda 3 (20/12/2025) - PASADO - Solo clarinetes y saxofones ==========
      {
        eventId: 22,
        componentId: 10, // Carmen - Clarinete
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 3: San Valentín Banda 1 (14/02/2027) - FUTURO ==========
      {
        eventId: 3,
        componentId: 1, // Javier
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 3,
        componentId: 3, // Carlos
        present: null,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 3,
        componentId: 4, // Antonio
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 3,
        componentId: 8, // María
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 3,
        componentId: 14, // Elena
        present: null,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 7: Ensayo Banda 1 (11/02/2027) - FUTURO ==========
      {
        eventId: 7,
        componentId: 1, // Javier
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 7,
        componentId: 3, // Carlos
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 7,
        componentId: 4, // Antonio
        present: null,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 7,
        componentId: 8, // María
        present: false,
        alleged: null,
        reason: 'Posible viaje de trabajo',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 7,
        componentId: 14, // Elena
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 10: Carnaval Banda 2 (22/02/2027) - FUTURO ==========
      {
        eventId: 10,
        componentId: 2, // Javier
        present: null,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 10,
        componentId: 6, // Francisco
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 10,
        componentId: 7, // Miguel
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 10,
        componentId: 9, // María
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 10,
        componentId: 12, // Laura
        present: null,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 14: Ensayo metales Banda 2 (05/02/2027) - FUTURO ==========
      {
        eventId: 14,
        componentId: 2, // Javier - Trompeta
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        componentId: 7, // Miguel - Trombón
        present: null,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 14,
        componentId: 12, // Laura - Corneta
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 15: Ensayo percusión Banda 2 (19/02/2027) - FUTURO ==========
      {
        eventId: 15,
        componentId: 6, // Francisco - Percusión
        present: null,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== EVENT 19: Día Andalucía Banda 3 (15/03/2027) - FUTURO ==========
      {
        eventId: 19,
        componentId: 5, // Antonio
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        componentId: 10, // Carmen
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        componentId: 11, // Isabel
        present: null,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        componentId: 13, // Laura
        present: true,
        alleged: null,
        reason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('EventAttendances', null, {});
  }
};
