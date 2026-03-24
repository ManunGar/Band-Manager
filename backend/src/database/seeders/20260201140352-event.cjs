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
        endDate: '2025-12-15',
        initialTime: '19:00:00',
        endTime: '21:30:00',
        name: 'Concierto de Navidad 2025',
        location: 'Teatro Municipal de Lora del Río',
        latitude: 37.6579,
        longitude: -5.5265,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2026-01-05',
        endDate: '2026-01-05',
        initialTime: '12:00:00',
        endTime: '13:30:00',
        name: 'Cabalgata de Reyes Magos',
        location: 'Lora del Río',
        latitude: 37.6579,
        longitude: -5.5265,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2027-02-14',
        endDate: '2027-02-14',
        initialTime: '20:00:00',
        endTime: '22:00:00',
        name: 'Concierto de San Valentín',
        location: 'Auditorio Municipal',
        latitude: 37.6579,
        longitude: -5.5265,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2027-03-28',
        endDate: '2027-03-28',
        initialTime: '18:30:00',
        endTime: '20:30:00',
        name: 'Concierto de Semana Santa',
        location: 'Iglesia Parroquial de Lora del Río',
        latitude: 37.6579,
        longitude: -5.5265,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ensayos Banda 1
      {
        bandId: 1,
        date: '2025-12-10',
        endDate: '2025-12-10',
        initialTime: '20:00:00',
        endTime: '22:00:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.6579,
        longitude: -5.5265,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2026-01-28',
        endDate: '2026-01-28',
        initialTime: '20:00:00',
        endTime: '22:00:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.6579,
        longitude: -5.5265,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 1,
        date: '2027-02-11',
        endDate: '2027-02-11',
        initialTime: '20:00:00',
        endTime: '22:00:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.6579,
        longitude: -5.5265,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== BANDA 2: Banda La Oliva de Salteras ==========
      
      // Actuaciones Banda 2
      {
        bandId: 2,
        date: '2025-11-20',
        endDate: '2025-11-20',
        initialTime: '19:30:00',
        endTime: '21:00:00',
        name: 'Concierto de Santa Cecilia',
        location: 'Casa de la Cultura de Salteras',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2026-01-18',
        endDate: '2026-01-18',
        initialTime: '13:00:00',
        endTime: '14:30:00',
        name: 'Pasacalles por el Casco Antiguo',
        location: 'Plaza de España, Salteras',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-02-22',
        endDate: '2027-02-22',
        initialTime: '12:00:00',
        endTime: '14:00:00',
        name: 'Carnaval 2026',
        location: 'Salteras',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-04-05',
        endDate: '2027-04-05',
        initialTime: '19:00:00',
        endTime: '21:00:00',
        name: 'Concierto de Primavera',
        location: 'Parque Municipal de Salteras',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-05-15',
        endDate: '2027-05-15',
        initialTime: '20:00:00',
        endTime: '22:30:00',
        name: 'Feria de Mayo',
        location: 'Recinto Ferial de Salteras',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ensayos Banda 2
      {
        bandId: 2,
        date: '2026-01-15',
        endDate: '2026-01-15',
        initialTime: '19:30:00',
        endTime: '21:30:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-02-05',
        endDate: '2027-02-05',
        initialTime: '19:30:00',
        endTime: '21:30:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-02-19',
        endDate: '2027-02-19',
        initialTime: '19:30:00',
        endTime: '21:30:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 2,
        date: '2027-04-02',
        endDate: '2027-04-02',
        initialTime: '19:30:00',
        endTime: '21:30:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.4103,
        longitude: -6.0989,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // ========== BANDA 3: AMC Cazalla de la Sierra ==========
      
      // Actuaciones Banda 3
      {
        bandId: 3,
        date: '2025-12-24',
        endDate: '2025-12-24',
        initialTime: '23:00:00',
        endTime: '00:30:00',
        name: 'Misa del Gallo',
        location: 'Parroquia de Nuestra Señora de la Consolación',
        latitude: 37.9312,
        longitude: -5.7524,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2026-01-12',
        endDate: '2026-01-12',
        initialTime: '18:00:00',
        endTime: '19:30:00',
        name: 'Concierto de Año Nuevo',
        location: 'Teatro Municipal de Cazalla',
        latitude: 37.9312,
        longitude: -5.7524,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-03-15',
        endDate: '2027-03-15',
        initialTime: '12:30:00',
        endTime: '14:00:00',
        name: 'Día de Andalucía',
        location: 'Plaza del Llano, Cazalla de la Sierra',
        latitude: 37.9312,
        longitude: -5.7524,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-04-19',
        endDate: '2027-04-19',
        initialTime: '11:00:00',
        endTime: '13:00:00',
        name: 'Procesión de Semana Santa',
        location: 'Recorrido procesional, Cazalla de la Sierra',
        latitude: 37.9312,
        longitude: -5.7524,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-06-07',
        endDate: '2027-06-07',
        initialTime: '21:00:00',
        endTime: '23:00:00',
        name: 'Concierto de Verano',
        location: 'Plaza de Toros de Cazalla',
        latitude: 37.9312,
        longitude: -5.7524,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Ensayos Banda 3
      {
        bandId: 3,
        date: '2025-12-20',
        endDate: '2025-12-20',
        initialTime: '20:30:00',
        endTime: '22:30:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.9312,
        longitude: -5.7524,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-02-08',
        endDate: '2027-02-08',
        initialTime: '20:30:00',
        endTime: '22:30:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.9312,
        longitude: -5.7524,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bandId: 3,
        date: '2027-03-12',
        endDate: '2027-03-12',
        initialTime: '20:30:00',
        endTime: '22:30:00',
        name: 'Ensayo',
        location: 'Local de ensayo de la banda',
        latitude: 37.9312,
        longitude: -5.7524,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Events', null, {});
  }
};

