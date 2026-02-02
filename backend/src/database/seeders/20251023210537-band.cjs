'use strict';
// Import path for file paths
const path = require('path');
// Import Cloudinary helpers
const { clearCloudinaryFolder, uploadToCloudinary } = require('../helpers/CloudinaryHelper.cjs');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    console.log('📤 Uploading new images to Cloudinary...');
    // Upload images from local files
    const bandProfilePic1 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/band_profile_pictures/banda_loradelrio.png'),
      'bandmanager/bands'
    );

    const bandProfilePic2 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/band_profile_pictures/banda_oliva.png'),
      'bandmanager/bands'
    );

    const bandProfilePic3 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/band_profile_pictures/banda_cazalla.png'),
      'bandmanager/bands'
    );


    return queryInterface.bulkInsert('Bands', [
      {
        name: 'Banda Municipal de Lora del Río',
        location: 'Lora del Río, Sevilla',
        phone: '955123456',
        type: 'Banda de Música',
        code: 'BMLR001',
        profile_picture: bandProfilePic1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Banda La Oliva de Salteras',
        location: 'Salteras, Sevilla',
        phone: '955654321',
        type: 'Banda de Música',
        code: 'BOS001',
        profile_picture: bandProfilePic2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'AMC Cazalla de la Sierra',
        location: 'Cazalla de la Sierra, Sevilla',
        phone: '955987654',
        type: 'Asociación Músico Cultural',
        code: 'AMC001',
        profile_picture: bandProfilePic3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    console.log('🗑️  Cleaning up Cloudinary images...');
    // Clear seed images when rolling back
    await clearCloudinaryFolder('bandmanager/bands');
    return queryInterface.bulkDelete('Bands', null, {});
  }
};
