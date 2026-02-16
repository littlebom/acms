
import { query } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function seedRegistrations() {
    try {
        console.log('Starting registration seed...');

        // 1. Find the Event
        const eventName = 'TCU International e-learning Conference';
        const events = await query('SELECT id FROM events WHERE name_en LIKE ?', [`%${eventName}%`]) as any[];

        if (events.length === 0) {
            console.error(`Event not found.`);
            process.exit(1);
        }
        const eventId = events[0].id;
        console.log(`Found event ID: ${eventId}`);

        // 2. Ensure Tickets Exist
        const tickets = await query('SELECT id FROM tickets WHERE event_id = ?', [eventId]) as any[];
        let ticketId;

        if (tickets.length === 0) {
            console.log('Creating Regular Ticket...');
            const result = await query(
                'INSERT INTO tickets (event_id, name, price, quota, available_until) VALUES (?, ?, ?, ?, ?)',
                [eventId, 'Regular Ticket', 1500.00, 100, '2025-11-20 23:59:59']
            ) as any;
            ticketId = result.insertId;
        } else {
            ticketId = tickets[0].id;
            console.log(`Using existing Ticket ID: ${ticketId}`);
        }

        // 3. Create 20 Mock Users (Attendees)
        const passwordHash = await bcrypt.hash('password123', 10);
        const attendeeData = [];
        for (let i = 1; i <= 20; i++) {
            attendeeData.push({
                email: `attendee${i}@example.com`,
                firstName: `Attendee${i}`,
                lastName: `TestUser`,
                role: 'attendee'
            });
        }

        let addedCount = 0;
        let checkInCount = 0;

        for (const user of attendeeData) {
            // Check if user exists
            const existingUser = await query('SELECT id FROM users WHERE email = ?', [user.email]) as any[];
            let userId;

            if (existingUser.length > 0) {
                userId = existingUser[0].id;
                // console.log(`User ${user.email} exists with ID ${userId}`);
            } else {
                const result = await query(
                    'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
                    [user.email, passwordHash, user.firstName, user.lastName, user.role]
                ) as any;
                userId = result.insertId;
            }

            // 4. Create Registration
            // Check if already registered via ticket join
            const existingRegViaTicket = await query(`
                SELECT r.id FROM registrations r
                JOIN tickets t ON r.ticket_id = t.id
                WHERE r.user_id = ? AND t.event_id = ?
            `, [userId, eventId]) as any[];

            if (existingRegViaTicket.length === 0) {
                // Determine Status and Check-in
                // 15 Paid & Checked In
                // 3 Paid & Not Checked In
                // 2 Pending

                let status = 'paid';
                let checkedInAt: Date | null = null;
                let approvedAt: Date | null = new Date();

                if (addedCount < 15) {
                    checkedInAt = new Date();
                    checkInCount++;
                } else if (addedCount < 18) {
                    checkedInAt = null;
                } else {
                    status = 'pending';
                    approvedAt = null;
                }

                await query(
                    'INSERT INTO registrations (user_id, ticket_id, status, checked_in_at, approved_at, registered_at) VALUES (?, ?, ?, ?, ?, NOW())',
                    [userId, ticketId, status, checkedInAt, approvedAt]
                );
                addedCount++;
            }
        }

        console.log(`Successfully seeded ${addedCount} registrations.`);
        console.log(`Checked in: ${checkInCount} users.`);
        process.exit(0);

    } catch (error) {
        console.error('Error Seeding Registrations:', error);
        process.exit(1);
    }
}

seedRegistrations();
