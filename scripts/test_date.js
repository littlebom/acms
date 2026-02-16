const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'KKiabkob',
        database: process.env.DB_NAME || 'acms_db'
    });

    try {
        // Try to update start_date with a JS Date object including time
        const d = new Date('2025-11-24T09:00:00');
        console.log('Updating with date:', d);
        await connection.execute('UPDATE events SET start_date = ? WHERE id = 7', [d]);
        console.log('Date Update Success');
    } catch (e) {
        console.error('Date Update Error:', e);
    } finally {
        await connection.end();
    }
}
main();
