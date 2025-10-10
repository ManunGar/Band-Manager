import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

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
})

// Models would be imported and initialized here

const db = {
    // Models go here
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

export { disconnectSequelize, initSequelize }
