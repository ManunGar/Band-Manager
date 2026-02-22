import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'
import loadBandModel from './band.js'
import loadComponentModel from './component.js'
import loadEventModel from './event.js'
import loadInstrumentModel from './instrument.js'
import loadMusicianModel from './musician.js'
import loadPerformanceModel from './performance.js'
import loadRehearsalModel from './rehearsal.js'
import loadUserModel from './user.js'

dotenv.config()
const database = process.env.DATABASE_NAME || 'band-manager'
const username = process.env.DATABASE_USERNAME || 'bmlora'
const password = process.env.DATABASE_PASSWORD || 'bmlora'
const host = process.env.DATABASE_HOST || 'localhost'
const port = process.env.DATABASE_PORT || 3306

const sequelizeConnection = new Sequelize(database, username, password, {
    host: host,
    port: port,
    dialect: 'mariadb',
    dialectOptions: {
        connectTimeout: 60000, // 60 segundos para establecer la conexión
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 60000, // 60 segundos para adquirir una conexión
        idle: 10000,
        evict: 10000
    },
    retry: {
        max: 3 // Número de reintentos
    }
})

// Models would be imported and initialized here
const User = loadUserModel(sequelizeConnection, Sequelize.DataTypes)
const Band = loadBandModel(sequelizeConnection, Sequelize.DataTypes)
const Musician = loadMusicianModel(sequelizeConnection, Sequelize.DataTypes)
const Instrument = loadInstrumentModel(sequelizeConnection, Sequelize.DataTypes)
const Component = loadComponentModel(sequelizeConnection, Sequelize.DataTypes)
const Event = loadEventModel(sequelizeConnection, Sequelize.DataTypes)
const Performance = loadPerformanceModel(sequelizeConnection, Sequelize.DataTypes)
const Rehearsal = loadRehearsalModel(sequelizeConnection, Sequelize.DataTypes)

const db = {
    // Models go here
    User,
    Band,
    Musician,
    Instrument,
    Component,
    Event,
    Performance,
    Rehearsal
}

// Create a db object to hold all models
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Function to initialize Sequelize connection
// This function is used in the app.js file to initialize the database connection
async function initSequelize() {
    await sequelizeConnection.authenticate()
    return sequelizeConnection
}

// Disconet Sequelize: Function for Tests
const disconnectSequelize = async (connection) => {
    return connection.close()
}

export { Band, Component, disconnectSequelize, Event, initSequelize, Instrument, Musician, Performance, Rehearsal, User }

