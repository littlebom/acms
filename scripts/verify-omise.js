const mysql = require('mysql2/promise');

async function verifyOmise() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'KKiabkob',
            database: 'acms_db'
        });

        const [rows] = await connection.execute('SELECT omise_public_key, omise_secret_key, omise_enabled FROM system_settings WHERE id = 1');
        
        if (rows.length === 0) {
            console.error('No system settings found.');
            process.exit(1);
        }

        const settings = rows[0];
        console.log('Omise Enabled:', !!settings.omise_enabled);
        
        if (!settings.omise_public_key || !settings.omise_secret_key) {
            console.error('Omise keys are missing in the database.');
            process.exit(1);
        }

        console.log('Public Key:', settings.omise_public_key.substring(0, 10) + '...');
        console.log('Secret Key:', settings.omise_secret_key.substring(0, 10) + '...');

        console.log('\nVerifying Secret Key with Omise API...');
        
        const response = await fetch('https://api.omise.co/account', {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(settings.omise_secret_key + ':').toString('base64')
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Omise Connection Successful!');
            console.log('Account Email:', data.email);
            console.log('Account ID:', data.id);
            console.log('Live Mode:', data.livemode);
        } else {
            console.error('❌ Omise Connection Failed.');
            console.error('Status:', response.status);
            const errorText = await response.text();
            console.error('Error:', errorText);
        }

    } catch (err) {
        console.error('An error occurred:', err);
    } finally {
        if (connection) await connection.end();
    }
}

verifyOmise();
