'use strict';
// Import bcrypt for password hashing
const bcrypt = require('bcryptjs');
// Import path for file paths
const path = require('path');
// Import Cloudinary helpers
const { clearCloudinaryFolder, uploadToCloudinary } = require('../helpers/CloudinaryHelper.cjs');

// Generate a salt for hashing passwords
const salt = bcrypt.genSaltSync(5);
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    console.log('📤 Uploading new images to Cloudinary...');
    // Upload images from local files
    const profilePicM1 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/male_1.png'),
      'bandmanager/users'
    );
    
    const profilePicM2 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/male_2.png'),
      'bandmanager/users'
    );

    const profilePicM3 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/male_3.png'),
      'bandmanager/users'
    );

    const profilePicM4 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/male_4.png'),
      'bandmanager/users'
    );

    const profilePicM5 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/male_5.png'),
      'bandmanager/users'
    );

    const profilePicF1 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/female_1.png'),
      'bandmanager/users'
    );

    const profilePicF2 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/female_2.png'),
      'bandmanager/users'
    );

    const profilePicF3 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/female_3.png'),
      'bandmanager/users'
    );

    const profilePicF4 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/female_4.png'),
      'bandmanager/users'
    );

    const profilePicF5 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/profile_pictures/female_5.png'),
      'bandmanager/users'
    );
    
    console.log('✅ Images uploaded successfully!');
    console.log('📝 Inserting users into database...');
    
    return queryInterface.bulkInsert('Users', [
      {
        username: 'manuel_nuno',
        email: 'manuel.nuno@gmail.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Manuel Nuño García',
        location: 'Lora del Río, Sevilla',
        latitude: 37.6583,
        longitude: -5.5261,
        phone: '654123789',
        birthday: '1990-05-15',
        token: 'admin-token',
        profile_picture: profilePicM1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'carlos_ruiz',
        email: 'carlos.ruiz82@hotmail.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Carlos Ruiz Fernández',
        location: 'Málaga, Málaga',
        latitude: 36.7213,
        longitude: -4.4214,
        phone: '678945123',
        birthday: '1982-11-22',
        token: 'token-carlos-ruiz',
        profile_picture: profilePicM2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'antonio_jimenez',
        email: 'antonio.jimenez@outlook.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Antonio Jiménez López',
        location: 'Granada, Granada',
        latitude: 37.1773,
        longitude: -3.5986,
        phone: '612345678',
        birthday: '1988-03-08',
        token: 'token-antonio-jimenez',
        profile_picture: profilePicM3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'francisco_martin',
        email: 'francisco.martin@yahoo.es',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Francisco Martín Pérez',
        location: 'Jerez de la Frontera, Cádiz',
        latitude: 36.6866,
        longitude: -6.1371,
        phone: '695812347',
        birthday: '1995-07-30',
        token: 'token-francisco-martin',
        profile_picture: profilePicM4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'miguel_navarro',
        email: 'miguel.navarro91@gmail.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Miguel Navarro González',
        location: 'Córdoba, Córdoba',
        latitude: 37.8882,
        longitude: -4.7794,
        phone: '687456321',
        birthday: '1991-12-03',
        token: 'token-miguel-navarro',
        profile_picture: profilePicM5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'maria_garcia',
        email: 'maria.garcia@gmail.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'María García Rodríguez',
        location: 'Huelva, Huelva',
        latitude: 37.2614,
        longitude: -6.9447,
        phone: '623987654',
        birthday: '1993-04-18',
        token: 'token-maria-garcia',
        profile_picture: profilePicF1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'carmen_lopez',
        email: 'carmen.lopez85@hotmail.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Carmen López Martínez',
        location: 'Almería, Almería',
        latitude: 36.8381,
        longitude: -2.4597,
        phone: '645234789',
        birthday: '1985-09-25',
        token: 'token-carmen-lopez',
        profile_picture: profilePicF2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'isabel_sanchez',
        email: 'isabel.sanchez@outlook.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Isabel Sánchez Romero',
        location: 'Marbella, Málaga',
        latitude: 36.5108,
        longitude: -4.8826,
        phone: '678321654',
        birthday: '1989-06-12',
        token: 'token-isabel-sanchez',
        profile_picture: profilePicF3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'laura_fernandez',
        email: 'laura.fernandez94@gmail.com',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Laura Fernández Díaz',
        location: 'Jaén, Jaén',
        latitude: 37.7796,
        longitude: -3.7849,
        phone: '691234567',
        birthday: '1994-01-27',
        token: 'token-laura-fernandez',
        profile_picture: profilePicF4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'elena_torres',
        email: 'elena.torres@yahoo.es',
        password: bcrypt.hashSync('Patata1234', salt),
        full_name: 'Elena Torres Muñoz',
        location: 'Cádiz, Cádiz',
        latitude: 36.5297,
        longitude: -6.2925,
        phone: '634567890',
        birthday: '1987-08-14',
        token: 'token-elena-torres',
        profile_picture: profilePicF5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    console.log('🗑️  Cleaning up Cloudinary images...');
    // Clear seed images when rolling back
    await clearCloudinaryFolder('bandmanager/users');
    return queryInterface.bulkDelete('Users', null, {});
  }
};
