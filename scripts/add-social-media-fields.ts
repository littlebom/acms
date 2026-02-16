import { createPool } from 'mysql2/promise';

const db = createPool({
    host: 'localhost',
    user: 'root',
    password: 'KKiabkob',
    database: 'acms_db',
});

async function migrate() {
    try {
        console.log('Adding YouTube, Line, and WhatsApp columns to system_settings...');

        const columns = [
            'social_youtube VARCHAR(255)',
            'social_line VARCHAR(255)',
            'social_whatsapp VARCHAR(255)'
        ];

        for (const col of columns) {
            try {
                await db.execute(`ALTER TABLE system_settings ADD COLUMN ${col}`);
                console.log(`✅ Added column: ${col.split(' ')[0]}`);
            } catch (error: any) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️  Column already exists: ${col.split(' ')[0]}`);
                } else {
                    throw error;
                }
            }
        }

        console.log('\n✅ Migration completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await db.end();
    }
}

migrate()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
