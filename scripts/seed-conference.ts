
import { query } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function seedConferenceData() {
    try {
        console.log('Starting conference data seed...');

        // 1. Find the Event
        const eventName = 'TCU International e-learning Conference';
        const events = await query('SELECT id FROM events WHERE name_en LIKE ? OR name_th LIKE ?', [`%${eventName}%`, `%${eventName}%`]) as any[];

        if (events.length === 0) {
            console.error(`Event "${eventName}" not found. Please create it first.`);
            process.exit(1);
        }

        const eventId = events[0].id;
        console.log(`Found event ID: ${eventId}`);

        // 2. Define Speakers
        const speakers = [
            {
                email: 'somchai.chair@tcu.ac.th',
                firstName: 'Somchai',
                lastName: 'Chair',
                bio: 'Conference Chair, Expert in EdTech Policy',
                role: 'chair'
            },
            {
                email: 'sarah.connor@mit.edu',
                firstName: 'Sarah',
                lastName: 'Connor',
                bio: 'Professor at MIT, AI Researcher',
                role: 'author' // Speakers can be authors or attendees with special status in session_speakers
            },
            {
                email: 'james.wan@uni.edu',
                firstName: 'James',
                lastName: 'Wan',
                bio: 'Digital Learning Specialist',
                role: 'author'
            },
            {
                email: 'linda.lee@tech.com',
                firstName: 'Linda',
                lastName: 'Lee',
                bio: 'CEO of EdTech Innovations',
                role: 'author'
            },
            {
                email: 'chen.wei@asia.edu',
                firstName: 'Wei',
                lastName: 'Chen',
                bio: 'Professor of Computer Science',
                role: 'author'
            },
            {
                email: 'david.brown@training.org',
                firstName: 'David',
                lastName: 'Brown',
                bio: 'Professional Trainer in GenAI',
                role: 'author'
            },
            {
                email: 'michael.ross@future.org',
                firstName: 'Michael',
                lastName: 'Ross',
                bio: 'Futurist and Educator',
                role: 'author'
            },
            {
                email: 'jessica.chen@interactive.io',
                firstName: 'Jessica',
                lastName: 'Chen',
                bio: 'Instructional Designer',
                role: 'author'
            }
        ];

        // 3. Create/Get Speakers in Users table
        const speakerMap = new Map<string, number>();
        const passwordHash = await bcrypt.hash('password123', 10);

        for (const speaker of speakers) {
            const existingUser = await query('SELECT id FROM users WHERE email = ?', [speaker.email]) as any[];
            let userId;

            if (existingUser.length > 0) {
                userId = existingUser[0].id;
                console.log(`User ${speaker.email} exists (ID: ${userId})`);
            } else {
                const result = await query(
                    'INSERT INTO users (email, password_hash, first_name, last_name, role, bio) VALUES (?, ?, ?, ?, ?, ?)',
                    [speaker.email, passwordHash, speaker.firstName, speaker.lastName, speaker.role, speaker.bio]
                ) as any;
                userId = result.insertId;
                console.log(`Created user ${speaker.email} (ID: ${userId})`);
            }
            speakerMap.set(speaker.email, userId);
        }

        // 4. Define Schedule (Sessions)
        // Calculating dates based on "Next month" - Let's fix it to Nov 24-25, 2025 as per plan
        const day1 = '2025-11-24';
        const day2 = '2025-11-25';

        const sessions = [
            // Day 1
            {
                title: 'Registration & Coffee',
                description: 'Check-in and morning refreshments.',
                startTime: `${day1} 08:00:00`,
                endTime: `${day1} 09:00:00`,
                room: 'Lobby',
                type: 'break',
                speakers: []
            },
            {
                title: 'Opening Ceremony',
                description: 'Welcome address by the Conference Chair.',
                startTime: `${day1} 09:00:00`,
                endTime: `${day1} 09:30:00`,
                room: 'Grand Hall',
                type: 'keynote',
                speakers: ['somchai.chair@tcu.ac.th']
            },
            {
                title: 'Keynote 1: AI Transforming Higher Education',
                description: 'Exploring the impact of Artificial Intelligence on university curriculums and teaching methods.',
                startTime: `${day1} 09:30:00`,
                endTime: `${day1} 10:30:00`,
                room: 'Grand Hall',
                type: 'keynote',
                speakers: ['sarah.connor@mit.edu']
            },
            {
                title: 'Morning Break',
                description: 'Networking and refreshments.',
                startTime: `${day1} 10:30:00`,
                endTime: `${day1} 10:45:00`,
                room: 'Lobby',
                type: 'break',
                speakers: []
            },
            {
                title: 'Panel Discussion: The Post-Digital University',
                description: 'Expert panel discussing the future of digital campuses.',
                startTime: `${day1} 10:45:00`,
                endTime: `${day1} 12:00:00`,
                room: 'Grand Hall',
                type: 'panel',
                speakers: ['james.wan@uni.edu', 'linda.lee@tech.com', 'chen.wei@asia.edu']
            },
            {
                title: 'Networking Lunch',
                description: 'International buffet lunch.',
                startTime: `${day1} 12:00:00`,
                endTime: `${day1} 13:30:00`,
                room: 'Dining Hall',
                type: 'break',
                speakers: []
            },
            {
                title: 'Parallel Session: Innovation in E-Learning',
                description: 'Technical presentations on new platform capabilities.',
                startTime: `${day1} 13:30:00`,
                endTime: `${day1} 15:00:00`,
                room: 'Room A',
                type: 'presentation',
                speakers: ['james.wan@uni.edu']
            },
            {
                title: 'Parallel Session: Learning Analytics',
                description: 'Data-driven insights for student success.',
                startTime: `${day1} 13:30:00`,
                endTime: `${day1} 15:00:00`,
                room: 'Room B',
                type: 'presentation',
                speakers: ['chen.wei@asia.edu']
            },
            {
                title: 'Afternoon Break',
                description: 'Coffee and snacks.',
                startTime: `${day1} 15:00:00`,
                endTime: `${day1} 15:30:00`,
                room: 'Lobby',
                type: 'break',
                speakers: []
            },
            {
                title: 'Workshop: Generative AI for Teachers',
                description: 'Hands-on workshop on using GenAI tools in the classroom.',
                startTime: `${day1} 15:30:00`,
                endTime: `${day1} 17:00:00`,
                room: 'Workshop Room 1',
                type: 'workshop',
                speakers: ['david.brown@training.org']
            },

            // Day 2
            {
                title: 'Keynote 2: Future Skills for 2030',
                description: 'What skills will graduates need in the next decade?',
                startTime: `${day2} 09:00:00`,
                endTime: `${day2} 10:30:00`,
                room: 'Grand Hall',
                type: 'keynote',
                speakers: ['michael.ross@future.org']
            },
            {
                title: 'Morning Break',
                description: 'Networking and refreshments.',
                startTime: `${day2} 10:30:00`,
                endTime: `${day2} 10:45:00`,
                room: 'Lobby',
                type: 'break',
                speakers: []
            },
            {
                title: 'Paper Presentations: Track A & B',
                description: 'Selected research paper presentations.',
                startTime: `${day2} 10:45:00`,
                endTime: `${day2} 12:15:00`,
                room: 'Room A & B',
                type: 'presentation',
                speakers: []
            },
            {
                title: 'Lunch',
                description: 'Buffet lunch.',
                startTime: `${day2} 12:15:00`,
                endTime: `${day2} 13:30:00`,
                room: 'Dining Hall',
                type: 'break',
                speakers: []
            },
            {
                title: 'Workshop: Building Interactive Courseware',
                description: 'Creating engaging online content.',
                startTime: `${day2} 13:30:00`,
                endTime: `${day2} 15:00:00`,
                room: 'Workshop Room 2',
                type: 'workshop',
                speakers: ['jessica.chen@interactive.io']
            },
            {
                title: 'Closing Ceremony & Awards',
                description: 'Awards for best papers and closing remarks.',
                startTime: `${day2} 15:00:00`,
                endTime: `${day2} 15:30:00`,
                room: 'Grand Hall',
                type: 'keynote',
                speakers: ['somchai.chair@tcu.ac.th']
            }
        ];

        // 5. Insert Sessions and Link Speakers
        for (const session of sessions) {
            // Check if session exists to avoid duplicates (chk by title and start time)
            const existingSession = await query(
                'SELECT id FROM sessions WHERE event_id = ? AND title = ? AND start_time = ?',
                [eventId, session.title, session.startTime]
            ) as any[];

            let sessionId;
            if (existingSession.length > 0) {
                sessionId = existingSession[0].id;
                console.log(`Session "${session.title}" exists (ID: ${sessionId})`);
            } else {
                const result = await query(
                    'INSERT INTO sessions (event_id, title, description, start_time, end_time, room, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [eventId, session.title, session.description, session.startTime, session.endTime, session.room, session.type]
                ) as any;
                sessionId = result.insertId;
                console.log(`Created session "${session.title}" (ID: ${sessionId})`);
            }

            // Link speakers
            for (const email of session.speakers) {
                const speakerId = speakerMap.get(email);
                if (speakerId) {
                    // Check existing link
                    const link = await query(
                        'SELECT * FROM session_speakers WHERE session_id = ? AND user_id = ?',
                        [sessionId, speakerId]
                    ) as any[];

                    if (link.length === 0) {
                        await query('INSERT INTO session_speakers (session_id, user_id) VALUES (?, ?)', [sessionId, speakerId]);
                        console.log(`Linked speaker ${email} to session ${sessionId}`);
                    }
                }
            }
        }

        console.log('Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error Seeding Data:', error);
        process.exit(1);
    }
}

seedConferenceData();
