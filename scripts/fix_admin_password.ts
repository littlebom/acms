
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function fix() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'acms_db'
        });

        const hash = await bcrypt.hash('password', 10);
        await connection.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, 'admin@example.com']);
        console.log('Admin password updated successfully.');
        await connection.end();
    } catch (err) {
        console.error('Error updating password:', err);
    }
}

fix();
