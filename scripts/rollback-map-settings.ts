import mysql from 'mysql2/promise';

async function dropMapColumn() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'KKiabkob',
        database: 'acms_db'
    });

    try {
        console.log('Dropping contact_map_url column from system_settings table...');

        // Try to drop the column, ignore error if it doesn't exist
        try {
            await connection.execute(
                'ALTER TABLE system_settings DROP COLUMN contact_map_url'
            );
            console.log('Successfully dropped contact_map_url column');
        } catch (error: any) {
            if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('Column contact_map_url does not exist, skipping...');
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

dropMapColumn()
    .then(() => {
        console.log('Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
