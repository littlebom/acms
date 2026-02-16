const mysql = require('mysql2/promise');

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'KKiabkob',
        database: process.env.DB_NAME || 'acms_db'
    });

    try {
        // Fetch current data for event 7
        const [rows] = await connection.execute('SELECT * FROM events WHERE id = 7');
        const evt = rows[0];

        // Simulate values from Form Data
        // User changes registration_form_id to 1.
        const name_en = evt.name_en;
        const name_th = evt.name_th;
        const description = evt.description;
        const venue_name = evt.venue_name;
        const venue_map_url = evt.venue_map_url;

        // Dates as Date objects (simulating parseDate)
        const start_date = evt.start_date ? new Date(evt.start_date) : null;
        const end_date = evt.end_date ? new Date(evt.end_date) : null;
        const submission_deadline = evt.submission_deadline ? new Date(evt.submission_deadline) : null;
        const registration_deadline = evt.registration_deadline ? new Date(evt.registration_deadline) : null;

        const registration_form_id = 1; // The change
        const speaker_group_id = evt.speaker_group_id; // Keep existing
        const schedule_id = evt.schedule_id; // Keep existing
        const id = 7;

        console.log('Params:', {
            name_en, name_th, description, venue_name, venue_map_url,
            start_date, end_date, submission_deadline, registration_deadline,
            registration_form_id, speaker_group_id, schedule_id, id
        });

        const sql = `UPDATE events SET 
                name_en = ?, name_th = ?, description = ?, 
                venue_name = ?, venue_map_url = ?,
                start_date = ?, end_date = ?,
                submission_deadline = ?, registration_deadline = ?,
                registration_form_id = ?, speaker_group_id = ?, schedule_id = ?
                WHERE id = ?`;

        await connection.execute(sql, [
            name_en, name_th, description,
            venue_name, venue_map_url,
            start_date, end_date,
            submission_deadline, registration_deadline,
            registration_form_id, speaker_group_id, schedule_id,
            id
        ]);

        console.log('Update Success!');

    } catch (e) {
        console.error('Update Failed:', e);
    } finally {
        await connection.end();
    }
}

main();
