const mysql = require('mysql2/promise');

async function verifyStripe() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'KKiabkob',
            database: 'acms_db'
        });

        const [rows] = await connection.execute('SELECT stripe_publishable_key, stripe_secret_key, stripe_enabled FROM system_settings WHERE id = 1');

        if (rows.length === 0) {
            console.error('No system settings found.');
            process.exit(1);
        }

        const settings = rows[0];
        console.log('Stripe Enabled:', !!settings.stripe_enabled);

        if (!settings.stripe_publishable_key || !settings.stripe_secret_key) {
            console.error('❌ Stripe keys are missing in the database.');
            process.exit(1);
        }

        console.log('Publishable Key:', settings.stripe_publishable_key.substring(0, 10) + '...');
        console.log('Secret Key:', settings.stripe_secret_key.substring(0, 10) + '...');

    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        if (connection) await connection.end();
    }
}

verifyStripe();
