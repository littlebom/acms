const mysql = require('mysql2/promise');

async function checkTable() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    const [rows] = await connection.execute('DESCRIBE sessions');
    console.log(rows);
    await connection.end();
}

checkTable();
