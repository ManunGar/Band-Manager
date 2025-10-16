import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { initPassport } from './config/passport.js';
import { initSequelize } from './models/sequelize.js';
import loadRoutes from './routes/index.js';

const initializeApp = async () => {
    dotenv.config();
    const app = express();
    app.use(morgan('dev'));
    app.use(cors());
    app.use(express.json());
    loadRoutes(app);
    initPassport();
    app.connection = await initializeDatabase() // Initialize DB connection and attach to app
    return app;
};

const initializeServer = async () => {
    try {
        const app = await initializeApp();
        const port = process.env.APP_PORT || 3030;
        const server = app.listen(port);
        console.log('Band Manager listening at http://localhost:' + server.address().port);
        return { server, app }
    } catch (error) {
        console.error('Error initializing server:', error);
        process.exit(1);
    }
};

const initializeDatabase = async () => {
    let connection
    try {
        connection = await initSequelize()
        console.log('INFO - Relational/MariaDB/Sequelize technology connected.')
    } catch (error) {
        console.error(error)
    }
    return connection
}

export { initializeServer };

