'use strict';
// Import bcrypt for password hashing
const bcrypt = require('bcryptjs');
// Generate a salt for hashing passwords
const salt = bcrypt.genSaltSync(5);
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Manuel Nuño García',
        location: 'Sevilla',
        phone: '605267619',
        birthday: '1995-10-23',
        token: 'admin-token',
        profile_picture: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'admin2',
        email: 'admin2@example.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Patata Nuño García',
        location: 'Sevilla',
        phone: '605267619',
        birthday: '1995-10-23',
        token: 'admin-token2',
        profile_picture: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Users', null, {});
    
  }
};
