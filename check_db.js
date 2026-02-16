var mysql = require('mysql2/promise');

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'KKiabkob',
            database: 'acms_db'
        });
        console.log('Successfully connected to the database.');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
}

check();
