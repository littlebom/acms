
import { createPool } from 'mysql2/promise';

const db = createPool({
    host: 'localhost',
    user: 'root',
    password: 'KKiabkob',
    database: 'acms_db',
});

async function migrate() {
    try {
        console.log('Migrating system_settings table...');

        const columns = [
            'contact_phone VARCHAR(50)',
            'contact_email VARCHAR(255)',
            'contact_address TEXT',
            'social_facebook VARCHAR(255)',
            'social_twitter VARCHAR(255)',
            'social_linkedin VARCHAR(255)'
        ];

        for (const col of columns) {
            try {
                await db.execute(`ALTER TABLE system_settings ADD COLUMN ${col}`);
                console.log(`Added column: ${col.split(' ')[0]}`);
            } catch (error: any) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column already exists: ${col.split(' ')[0]}`);
                } else {
                    console.error(`Failed to add column ${col}:`, error);
                }
            }
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await db.end();
    }
}

migrate();
