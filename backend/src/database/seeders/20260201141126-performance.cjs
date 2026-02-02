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
        name: 'Concierto de Navidad 2025',
        type: 'Concierto',
        place: 'Teatro Municipal de Lora del Río',
        comment: 'Programa navideño con villancicos tradicionales y obras sinfónicas',
        picture: performancePic1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 2,
        name: 'Cabalgata de Reyes Magos',
        type: 'Procesión',
        place: 'Lora del Río',
        comment: 'Acompañamiento musical durante el recorrido de la Cabalgata',
        picture: performancePic2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 3,
        name: 'Concierto de San Valentín',
        type: 'Concierto',
        place: 'Auditorio Municipal',
        comment: 'Concierto temático con música romántica y bandas sonoras de cine',
        picture: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 4,
        name: 'Concierto de Semana Santa',
        type: 'Concierto',
        place: 'Iglesia Parroquial de Lora del Río',
        comment: 'Marchas procesionales y música sacra',
        picture: performancePic3,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ========== ACTUACIONES BANDA 2: Banda La Oliva de Salteras ==========

      {
        eventId: 8,
        name: 'Concierto de Santa Cecilia',
        type: 'Concierto',
        place: 'Casa de la Cultura de Salteras',
        comment: 'Celebración del día de Santa Cecilia, patrona de los músicos',
        picture: performancePic4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 9,
        name: 'Pasacalles por el Casco Antiguo',
        type: 'Pasacalles',
        place: 'Plaza de España, Salteras',
        comment: 'Pasacalles festivo por las calles del pueblo',
        picture: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 10,
        name: 'Carnaval 2026',
        type: 'Pasacalles',
        place: 'Salteras',
        comment: 'Acompañamiento del desfile de Carnaval',
        picture: performancePic5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 11,
        name: 'Concierto de Primavera',
        type: 'Concierto',
        place: 'Parque Municipal de Salteras',
        comment: 'Concierto al aire libre con repertorio variado',
        picture: performancePic6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 12,
        name: 'Feria de Mayo',
        type: 'Pasacalles',
        place: 'Recinto Ferial de Salteras',
        comment: 'Actuación durante las fiestas patronales',
        picture: performancePic7,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ========== ACTUACIONES BANDA 3: AMC Cazalla de la Sierra ==========

      {
        eventId: 17,
        name: 'Misa del Gallo',
        type: 'Concierto',
        place: 'Parroquia de Nuestra Señora de la Consolación',
        comment: 'Acompañamiento musical de la Misa del Gallo',
        picture: performancePic8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 18,
        name: 'Concierto de Año Nuevo',
        type: 'Concierto',
        place: 'Teatro Municipal de Cazalla',
        comment: 'Concierto extraordinario con obras clásicas y populares',
        picture: performancePic9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 19,
        name: 'Día de Andalucía',
        type: 'Pasacalles',
        place: 'Plaza del Llano, Cazalla de la Sierra',
        comment: 'Celebración del Día de Andalucía con himno y pasodobles',
        picture: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 20,
        name: 'Procesión de Semana Santa',
        type: 'Procesión',
        place: 'Recorrido procesional, Cazalla de la Sierra',
        comment: 'Acompañamiento de la Hermandad del Santo Entierro',
        picture: performancePic10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        eventId: 21,
        name: 'Concierto de Verano',
        type: 'Concierto',
        place: 'Plaza de Toros de Cazalla',
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
