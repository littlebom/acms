const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'KKiabkob',
        database: process.env.DB_NAME || 'acms_db'
    });

    try {
        const [rows] = await connection.execute("SHOW COLUMNS FROM events");
        console.log("Columns:", rows.map(r => ({ Field: r.Field, Null: r.Null })));
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

main();
