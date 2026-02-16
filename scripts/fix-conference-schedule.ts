
import { query } from '../src/lib/db';

async function fixConferenceData() {
    try {
        console.log('Fixing conference data...');

        // 1. Find the Event
        const eventName = 'TCU International e-learning Conference';
        const events = await query('SELECT id FROM events WHERE name_en LIKE ?', [`%${eventName}%`]) as any[];

        if (events.length === 0) {
            console.error(`Event not found.`);
            process.exit(1);
        }
        const eventId = events[0].id;

        // 2. Create Schedule if not exists (or find it)
        const eventDetails = await query('SELECT schedule_id, speaker_group_id FROM events WHERE id = ?', [eventId]) as any[];
        let scheduleId = eventDetails[0]?.schedule_id;
        let speakerGroupId = eventDetails[0]?.speaker_group_id;

        if (!scheduleId) {
            console.log('Creating Schedule record...');
            const result = await query(
                'INSERT INTO schedules (title, description, event_id) VALUES (?, ?, ?)',
                [`Schedule for ${eventName}`, 'Official Conference Schedule', eventId]
            ) as any;
            scheduleId = result.insertId;

            // Link event to schedule
            await query('UPDATE events SET schedule_id = ? WHERE id = ?', [scheduleId, eventId]);
            console.log(`Created Schedule ID: ${scheduleId}`);
        } else {
            console.log(`Schedule ID ${scheduleId} already exists.`);
        }

        // 3. Update Sessions with schedule_id
        console.log('Updating sessions with schedule_id...');
        await query('UPDATE sessions SET schedule_id = ? WHERE event_id = ?', [scheduleId, eventId]);

        // 4. Create Speaker Group if not exists
        if (!speakerGroupId) {
            console.log('Creating Speaker Group...');
            const result = await query('INSERT INTO speaker_groups (name, event_id) VALUES (?, ?)', [`Speakers for ${eventName}`, eventId]) as any;
            speakerGroupId = result.insertId;

            // Link event to group
            await query('UPDATE events SET speaker_group_id = ? WHERE id = ?', [speakerGroupId, eventId]);
            console.log(`Created Speaker Group ID: ${speakerGroupId}`);
        } else {
            console.log(`Speaker Group ID ${speakerGroupId} already exists.`);
        }

        // 5. Add Speakers to Group
        const speakers = await query(`
            SELECT DISTINCT u.id 
            FROM session_speakers ss
            JOIN sessions s ON ss.session_id = s.id
            JOIN users u ON ss.user_id = u.id
            WHERE s.event_id = ?
        `, [eventId]) as any[];

        console.log(`Found ${speakers.length} speakers to add to group.`);

        for (const speaker of speakers) {
            const inGroup = await query('SELECT * FROM speaker_group_members WHERE group_id = ? AND user_id = ?', [speakerGroupId, speaker.id]) as any[];
            if (inGroup.length === 0) {
                await query('INSERT INTO speaker_group_members (group_id, user_id) VALUES (?, ?)', [speakerGroupId, speaker.id]);
            }
        }

        // 6. Update Schedule Settings (Days & Rooms) from Sessions
        console.log('Updating schedule settings...');
        const sessionDetails = await query('SELECT start_time, room FROM sessions WHERE event_id = ?', [eventId]) as any[];

        const daysSet = new Set<string>();
        const roomsSet = new Set<string>();

        sessionDetails.forEach(s => {
            const date = s.start_time.toISOString().split('T')[0]; // YYYY-MM-DD
            daysSet.add(date);
            if (s.room) roomsSet.add(s.room);
        });

        const settings = {
            days: Array.from(daysSet).sort(),
            rooms: Array.from(roomsSet).sort()
        };

        await query('UPDATE schedules SET settings = ? WHERE id = ?', [JSON.stringify(settings), scheduleId]);
        console.log('Updated settings:', settings);

        console.log('Data fix completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error Fixing Data:', error);
        process.exit(1);
    }
}

fixConferenceData();
