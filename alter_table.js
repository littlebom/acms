const mysql = require('mysql2/promise');

async function addCol() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        await connection.execute('ALTER TABLE sessions ADD COLUMN chair VARCHAR(255) NULL');
        console.log('Column added');
    } catch (e) {
        console.log(e);
    }
    await connection.end();
}

addCol();
