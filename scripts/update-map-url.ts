import { createPool } from 'mysql2/promise';

const db = createPool({
    host: 'localhost',
    user: 'root',
    password: 'KKiabkob',
    database: 'acms_db',
});

async function updateMapUrl() {
    try {
        console.log('Updating Google Map URL in system_settings...');

        const mapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.260043741693!2d100.54160328180969!3d13.763185562575693!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29e95a7412aab%3A0x8d99187de3c1ba32!2sLPN%20Suite%20Dindaeng%20-%20Rachaprarop!5e0!3m2!1sen!2sth!4v1768306113948!5m2!1sen!2sth';

        await db.execute(
            'UPDATE system_settings SET contact_map_url = ? WHERE id = 1',
            [mapUrl]
        );

        console.log('✅ Successfully updated Google Map URL');
        console.log('Location: LPN Suite Dindaeng - Rachaprarop');
        console.log('\nYou can now visit http://localhost:3000/contact to see the map!');

    } catch (error) {
        console.error('Update failed:', error);
        throw error;
    } finally {
        await db.end();
    }
}

updateMapUrl()
    .then(() => {
        console.log('\n✅ Update completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Update failed:', error);
        process.exit(1);
    });
