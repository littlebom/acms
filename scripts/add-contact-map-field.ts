import { createPool } from 'mysql2/promise';

const db = createPool({
    host: 'localhost',
    user: 'root',
    password: 'KKiabkob',
    database: 'acms_db',
});

async function migrate() {
    try {
        console.log('Adding contact_map_url column to system_settings table...');

        try {
            await db.execute(
                'ALTER TABLE system_settings ADD COLUMN contact_map_url TEXT'
            );
            console.log('Successfully added contact_map_url column');
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('Column contact_map_url already exists, skipping...');
            } else {
                throw error;
            }
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await db.end();
    }
}

migrate()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
