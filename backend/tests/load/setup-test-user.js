/**
 * Script de setup para tests de carga — crea el usuario de prueba en la BD
 *
 * Ejecutar desde el directorio /backend antes de lanzar k6:
 *   node tests/load/setup-test-user.js
 *
 * Variables de entorno opcionales:
 *   TEST_USERNAME=miusuario TEST_PASSWORD=mipassword node tests/load/setup-test-user.js
 */

import crypto from 'crypto';
import { Musician, User, disconnectSequelize, initSequelize } from '../../src/models/sequelize.js';

const TEST_USERNAME = process.env.TEST_USERNAME || 'testuser';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';
const TEST_EMAIL    = process.env.TEST_EMAIL    || 'testuser@loadtest.local';

async function main() {
    let connection;
    try {
        connection = await initSequelize();
        console.log('Conectado a la base de datos.');

        const existing = await User.findOne({ where: { username: TEST_USERNAME } });

        if (existing) {
            // Actualiza la contraseña por si cambió desde la última ejecución.
            // El setter del modelo se encarga del hash automáticamente.
            await existing.update({ password: TEST_PASSWORD });
            console.log(`Usuario "${TEST_USERNAME}" ya existe — contraseña actualizada.`);
        } else {
            const user = await User.create({
                full_name:  'Test User Load',
                username:   TEST_USERNAME,
                email:      TEST_EMAIL,
                password:   TEST_PASSWORD,
                location:   'Test City',
                longitude:  0.0,
                latitude:   0.0,
                phone:      '000000000',
                birthday:   '1990-01-01',
                token:      crypto.randomBytes(16).toString('hex'),
            });

            await Musician.create({
                userId:           user.id,
                isProfilePrivate: false,
            });

            console.log(`Usuario "${TEST_USERNAME}" creado con id=${user.id}.`);
        }

        console.log('\nPuedes lanzar el test con:');
        console.log(`  k6 run tests/load/api-load-test.js`);
        console.log('O con credenciales personalizadas:');
        console.log(`  k6 run -e API_USERNAME=${TEST_USERNAME} -e API_PASSWORD=${TEST_PASSWORD} tests/load/api-load-test.js`);

    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) await disconnectSequelize(connection);
    }
}

main();
