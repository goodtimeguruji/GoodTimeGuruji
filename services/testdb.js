const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });
        console.log("✅ Successfully connected to Hostinger MySQL!");
        await connection.end();
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
    }
}

testConnection();