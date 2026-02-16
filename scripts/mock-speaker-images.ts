
import { query } from '../src/lib/db';

async function mockSpeakerImages() {
    try {
        console.log('Adding mock images to speakers...');

        // 1. Find the Event and its Speaker Group
        const eventName = 'TCU International e-learning Conference';
        const events = await query('SELECT speaker_group_id FROM events WHERE name_en LIKE ?', [`%${eventName}%`]) as any[];

        if (events.length === 0 || !events[0].speaker_group_id) {
            console.error(`Event or speaker group not found for ${eventName}.`);
            process.exit(1);
        }

        const groupId = events[0].speaker_group_id;
        console.log(`Found Speaker Group ID: ${groupId}`);

        const members = await query('SELECT user_id FROM speaker_group_members WHERE group_id = ?', [groupId]) as any[];

        console.log(`Found ${members.length} speakers.`);

        // 2. Update with random avatars
        // Using distinct images for variety
        const images = [
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800', // Man suit
            'https://images.unsplash.com/photo-1573496359-136d4755f36f?auto=format&fit=crop&q=80&w=800', // Woman glasses
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=800', // Man smile
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800', // Woman smile
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800', // Man casual
            'https://images.unsplash.com/photo-1598550874175-4d7112ee7f43?auto=format&fit=crop&q=80&w=800', // Man glasses
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800', // Man portrait
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800', // Woman doctor/white coat
        ];

        for (let i = 0; i < members.length; i++) {
            const userId = members[i].user_id;
            const imageUrl = images[i % images.length];

            await query('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, userId]);
            console.log(`Updated user ${userId} with image.`);
        }

        console.log('Mock images added successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error adding mock images:', error);
        process.exit(1);
    }
}

mockSpeakerImages();
