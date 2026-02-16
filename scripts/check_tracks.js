
const mysql = require('mysql2/promise');

async function checkTracks() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'KKiabkob',
            database: process.env.DB_NAME || 'acms_db'
        });

        // Get Tracks and their Paper Counts
        const [tracks] = await connection.execute(`
            SELECT t.id, t.name, COUNT(p.id) as paper_count 
            FROM paper_tracks t
            LEFT JOIN papers p ON t.id = p.track_id
            GROUP BY t.id, t.name
            ORDER BY paper_count DESC
        `);

        console.log('Tracks and Paper Counts:', tracks);
        await connection.end();
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkTracks();
