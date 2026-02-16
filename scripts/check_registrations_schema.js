
const mysql = require('mysql2/promise');

async function checkRegistrationsSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'KKiabkob',
            database: process.env.DB_NAME || 'acms_db'
        });

        const [columns] = await connection.execute('DESCRIBE registrations');
        console.log('Registrations Columns:', columns);
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkRegistrationsSchema();
