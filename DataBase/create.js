const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const PORT = 3001;
const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config({ path: '../SERVER/.env' });

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    await createTables(db);
}

async function createTables(connection) {
    // users
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            is_active BOOLEAN DEFAULT TRUE,
            username VARCHAR(100) NOT NULL,
            git_name VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            phone INT NOT NULL,
            experience INT NOT NULL,
            languages VARCHAR(255),
            role VARCHAR(100) NOT NULL,
            rating INT
        )
    `);

    // passwords
    await connection.query(`
        CREATE TABLE IF NOT EXISTS passwords (
            is_active BOOLEAN DEFAULT TRUE,
            user_id INT PRIMARY KEY,
            hashed_password VARCHAR(255) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // projects
    await connection.query(`
        CREATE TABLE IF NOT EXISTS projects (
            is_active BOOLEAN DEFAULT TRUE,
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            url VARCHAR(255) NOT NULL,
            languages VARCHAR(255),
            details VARCHAR(255),
            views INT NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // jobs
    await connection.query(`
        CREATE TABLE IF NOT EXISTS jobs (
            is_active BOOLEAN DEFAULT TRUE,
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            experience INT NOT NULL,
            languages VARCHAR(255),
            views INT NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // massages
    await connection.query(`
        CREATE TABLE IF NOT EXISTS massages (
            is_active BOOLEAN DEFAULT TRUE,
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(100) NOT NULL,
            content VARCHAR(100),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
}

main();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
