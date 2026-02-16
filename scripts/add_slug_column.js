const mysql = require('mysql2/promise');

async function main() {
    console.log('Starting migration: Add slug column to events table...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'KKiabkob',
        database: process.env.DB_NAME || 'acms_db'
    });

    try {
        // 1. Check if column exists
        const [columns] = await connection.execute("SHOW COLUMNS FROM events LIKE 'slug'");

        if (columns.length > 0) {
            console.log('Column "slug" already exists. Skipping add.');
        } else {
            console.log('Adding "slug" column...');
            // Add as nullable first allows us to fill data
            await connection.execute("ALTER TABLE events ADD COLUMN slug VARCHAR(255) NULL UNIQUE AFTER name_th");
            console.log('Column added.');
        }

        // 2. Populate existing slugs
        console.log('Populating empty slugs...');
        // We use event-{id} as a fallback for older events, and maybe 'acms-2025' for the active one effectively?
        // Let's just use event-{id} for everything for safety first, then admin can change it.
        // Or if we know ID 1 is ACMS 2025, we could be smarter. But generic is safer.
        await connection.execute("UPDATE events SET slug = CONCAT('event-', id) WHERE slug IS NULL");
        console.log('Slugs populated.');

        // 3. Enforce NOT NULL
        console.log('Enforcing NOT NULL constraint...');
        await connection.execute("ALTER TABLE events MODIFY slug VARCHAR(255) NOT NULL");
        console.log('Constraint applied.');

        console.log('Migration completed successfully.');

    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await connection.end();
    }
}

main();
