const mysql = require('mysql2/promise');

async function updateSchema() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        // Check if column exists
        const [cols] = await connection.execute("SHOW COLUMNS FROM reviewers LIKE 'track_id'");

        if (cols.length === 0) {
            console.log('Adding track_id column to reviewers table...');
            await connection.execute(`
                ALTER TABLE reviewers 
                ADD COLUMN track_id INT NULL AFTER affiliation,
                ADD FOREIGN KEY (track_id) REFERENCES paper_tracks(id) ON DELETE SET NULL
            `);
            console.log('Successfully added track_id column.');
        } else {
            console.log('track_id column already exists.');
        }

        const [newCols] = await connection.execute("DESCRIBE reviewers");
        console.log('Reviewers table structure:', newCols.map(c => c.Field));

    } catch (e) {
        console.error('Error updating schema:', e);
    } finally {
        await connection.end();
    }
}

updateSchema();
