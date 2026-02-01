'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Components', [
      // Manuel Nuño (Musician 1) - En bandas 1 y 2, admin de la banda 1
      {
        musicianId: 1,
        bandId: 1,
        private: false,
        administrator: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 1,
        bandId: 2,
        private: false,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Carlos Ruiz (Musician 2) - En banda 1, admin
      {
        musicianId: 2,
        bandId: 1,
        private: false,
        administrator: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Antonio Jiménez (Musician 3) - En bandas 1 y 3
      {
        musicianId: 3,
        bandId: 1,
        private: false,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 3,
        bandId: 3,
        private: false,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Francisco Martín (Musician 4) - En banda 2, admin
      {
        musicianId: 4,
        bandId: 2,
        private: false,
        administrator: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Miguel Navarro (Musician 5) - En banda 2
      {
        musicianId: 5,
        bandId: 2,
        private: false,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // María García (Musician 6) - En bandas 1 y 2
      {
        musicianId: 6,
        bandId: 1,
        private: false,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 6,
        bandId: 2,
        private: true,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Carmen López (Musician 7) - En banda 3, admin
      {
        musicianId: 7,
        bandId: 3,
        private: false,
        administrator: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Isabel Sánchez (Musician 8) - En banda 3
      {
        musicianId: 8,
        bandId: 3,
        private: false,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Laura Fernández (Musician 9) - En bandas 2 y 3
      {
        musicianId: 9,
        bandId: 2,
        private: false,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        musicianId: 9,
        bandId: 3,
        private: true,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Elena Torres (Musician 10) - En banda 1
      {
        musicianId: 10,
        bandId: 1,
        private: false,
        administrator: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Components', null, {});
  }
};
