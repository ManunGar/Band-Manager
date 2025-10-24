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
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
