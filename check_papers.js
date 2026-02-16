const mysql = require('mysql2/promise');

async function checkPapers() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        const [cols] = await connection.execute("DESCRIBE papers");
        console.log('Papers columns:', cols.map(c => c.Field));
    } catch (e) {
        console.log(e);
    }
    await connection.end();
}

checkPapers();
