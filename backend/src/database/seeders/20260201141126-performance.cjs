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
    const performancePic1 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_1.png'),
      'bandmanager/performances'
    );

    const performancePic2 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_2.png'),
      'bandmanager/performances'
    );

    const performancePic3 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_3.png'),
      'bandmanager/performances'
    );

    const performancePic4 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_4.png'),
      'bandmanager/performances'
    );

    const performancePic5 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_5.png'),
      'bandmanager/performances'
    );

    const performancePic6 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_6.png'),
      'bandmanager/performances'
    );

    const performancePic7 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_7.png'),
      'bandmanager/performances'
    );

    const performancePic8 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_8.png'),
      'bandmanager/performances'
    );

    const performancePic9 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_9.png'),
      'bandmanager/performances'
    );

    const performancePic10 = await uploadToCloudinary(
      path.join(__dirname, '../../../public/performances_pictures/performance_10.png'),
      'bandmanager/performances'
    );

    console.log('✅ Images uploaded successfully!');
    console.log('📝 Inserting performances into database...');

    return queryInterface.bulkInsert('Performances', [
      // ========== ACTUACIONES BANDA 1: Banda Municipal de Lora del Río ==========

      {
        eventId: 1,
        type: 'Concierto',
        comment: 'Programa navideño con villancicos tradicionales y obras sinfónicas',
        picture: performancePic1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        type: 'Procesión',
        comment: 'Acompañamiento musical durante el recorrido de la Cabalgata',
        picture: performancePic2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 3,
        type: 'Concierto',
        comment: 'Concierto temático con música romántica y bandas sonoras de cine',
        picture: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 4,
        type: 'Concierto',
        comment: 'Marchas procesionales y música sacra',
        picture: performancePic3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ========== ACTUACIONES BANDA 2: Banda La Oliva de Salteras ==========

      {
        eventId: 8,
        type: 'Concierto',
        comment: 'Celebración del día de Santa Cecilia, patrona de los músicos',
        picture: performancePic4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        type: 'Pasacalles',
        comment: 'Pasacalles festivo por las calles del pueblo',
        picture: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 10,
        type: 'Pasacalles',
        comment: 'Acompañamiento del desfile de Carnaval',
        picture: performancePic5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 11,
        type: 'Concierto',
        comment: 'Concierto al aire libre con repertorio variado',
        picture: performancePic6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 12,
        type: 'Pasacalles',
        comment: 'Actuación durante las fiestas patronales',
        picture: performancePic7,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ========== ACTUACIONES BANDA 3: AMC Cazalla de la Sierra ==========

      {
        eventId: 17,
        type: 'Concierto',
        comment: 'Acompañamiento musical de la Misa del Gallo',
        picture: performancePic8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 18,
        type: 'Concierto',
        comment: 'Concierto extraordinario con obras clásicas y populares',
        picture: performancePic9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        type: 'Pasacalles',
        comment: 'Celebración del Día de Andalucía con himno y pasodobles',
        picture: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 20,
        type: 'Procesión',
        comment: 'Acompañamiento de la Hermandad del Santo Entierro',
        picture: performancePic10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 21,
        type: 'Concierto',
        comment: 'Gran concierto de verano con pasodobles y música festiva',
        picture: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    console.log('🗑️  Cleaning up Cloudinary images...');
    // Clear seed images when rolling back
    await clearCloudinaryFolder('bandmanager/performances');
    return queryInterface.bulkDelete('Performances', null, {});
  }
};
