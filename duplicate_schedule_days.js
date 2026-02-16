const mysql = require('mysql2/promise');

async function duplicateSchedule() {
    const connection = await mysql.createConnection('mysql://root:KKiabkob@localhost:3306/acms_db');

    try {
        const scheduleId = 8;
        const sourceDate = '2026-12-02';
        const targetDates = ['2026-12-03', '2026-12-04'];

        // 1. Fetch sessions for the source date
        // Note: We use LIKE '2026-12-02%' to match the date part of the start_time
        const [sessions] = await connection.execute(
            'SELECT * FROM sessions WHERE schedule_id = ? AND DATE(start_time) = ?',
            [scheduleId, sourceDate]
        );

        console.log(`Found ${sessions.length} sessions to duplicate.`);

        for (const targetDate of targetDates) {
            console.log(`Duplicating to ${targetDate}...`);

            for (const session of sessions) {
                // Calculate new start and end times
                const sourceStart = new Date(session.start_time);
                const sourceEnd = new Date(session.end_time);

                const targetStart = new Date(targetDate);
                targetStart.setHours(sourceStart.getHours(), sourceStart.getMinutes(), sourceStart.getSeconds());

                const targetEnd = new Date(targetDate);
                targetEnd.setHours(sourceEnd.getHours(), sourceEnd.getMinutes(), sourceEnd.getSeconds());

                // Insert new session
                const [result] = await connection.execute(
                    `INSERT INTO sessions (schedule_id, title, description, start_time, end_time, room, type, chair_id)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        session.schedule_id,
                        session.title,
                        session.description,
                        targetStart,
                        targetEnd,
                        session.room,
                        session.type,
                        session.chair_id
                    ]
                );

                const newSessionId = result.insertId;

                // 2. Duplicate speakers
                const [speakers] = await connection.execute(
                    'SELECT user_id FROM session_speakers WHERE session_id = ?',
                    [session.id]
                );

                for (const speaker of speakers) {
                    await connection.execute(
                        'INSERT INTO session_speakers (session_id, user_id) VALUES (?, ?)',
                        [newSessionId, speaker.user_id]
                    );
                }

                // 3. Duplicate attachments
                const [attachments] = await connection.execute(
                    'SELECT file_name, file_url, file_type FROM session_attachments WHERE session_id = ?',
                    [session.id]
                );

                for (const attachment of attachments) {
                    await connection.execute(
                        'INSERT INTO session_attachments (session_id, file_name, file_url, file_type) VALUES (?, ?, ?, ?)',
                        [newSessionId, attachment.file_name, attachment.file_url, attachment.file_type]
                    );
                }
            }
        }

        console.log('Duplication completed successfully.');

    } catch (error) {
        console.error('Duplication error:', error);
    } finally {
        await connection.end();
    }
}

duplicateSchedule();
