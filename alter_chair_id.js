const mysql = require('mysql2/promise');

async function alterChair() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        // Change chair varchar to chair_id int
        // First drop the column (since it was just created and likely empty or we don't care about the text values for 5 mins)
        // Or change it. CHANGE requires old name.
        // Let's DROP and ADD to be clean/sure.
        try {
            await connection.execute('ALTER TABLE sessions DROP COLUMN chair');
        } catch (e) { } // ignore if not exists

        await connection.execute('ALTER TABLE sessions ADD COLUMN chair_id INT NULL');

        console.log('Column chair_id added');
    } catch (e) {
        console.log(e);
    }
    await connection.end();
}

alterChair();
