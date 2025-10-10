require('dotenv').config()
module.exports = {
  development: {
    username: process.env.DATABASE_USERNAME || 'bmlora',
    password: process.env.DATABASE_PASSWORD || 'bmlora',
    database: process.env.DATABASE_NAME || 'band-manager',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 3306,
    appPort: process.env.APP_PORT || 3030,
    dialect: 'mariadb'
  },
  test: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: 'mariadb'
  },
  production: {
    username: process.env.DATABASE_USERNAME || 'bmlora',
    password: process.env.DATABASE_PASSWORD || 'bmlora',
    database: process.env.DATABASE_NAME || 'pueblo_duerme',
    host: process.env.DATABASE_HOST || 'localhost',
    port: process.env.DATABASE_PORT || 3306,
    dialect: 'mariadb'
  }
}
