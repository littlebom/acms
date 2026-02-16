const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        const [tracks] = await connection.execute("SHOW TABLES LIKE 'tracks'");
        console.log('Tracks table:', tracks);

        if (tracks.length > 0) {
            const [cols] = await connection.execute("DESCRIBE tracks");
            console.log('Tracks columns:', cols.map(c => c.Field));
        }

        const [rCols] = await connection.execute("DESCRIBE reviewers");
        console.log('Reviewers columns:', rCols.map(c => c.Field));

    } catch (e) {
        console.log(e);
    }
    await connection.end();
}

checkSchema();
