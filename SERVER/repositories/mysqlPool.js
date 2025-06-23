const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const validateEnvironmentVariables = () => {
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
};

const createPool = () => {
    try {
        validateEnvironmentVariables();

        const poolConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT, 10),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            acquireTimeout: 60000,
            timeout: 60000,
            reconnect: true
        };

        return mysql.createPool(poolConfig);
    } catch (error) {
        console.error('Error creating database pool:', error.message);
        throw new Error(`Database pool creation failed: ${error.message}`);
    }
};

const pool = createPool();

pool.on('connection', (connection) => {
    console.log('New database connection established');
});

pool.on('error', (error) => {
    console.error('Database pool error:', error.message);
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection lost, pool will reconnect');
    }
});

module.exports = pool;