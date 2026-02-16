
import { query } from '../src/lib/db';

async function deleteEmptyTracks() {
    try {
        console.log('Checking for empty tracks...');

        // 1. Get tracks with 0 papers
        const emptyTracks = await query(`
            SELECT t.id, t.name 
            FROM paper_tracks t
            LEFT JOIN papers p ON t.id = p.track_id
            WHERE p.id IS NULL
        `) as any[];

        if (emptyTracks.length === 0) {
            console.log('No empty tracks found.');
            process.exit(0);
        }

        console.log(`Found ${emptyTracks.length} empty tracks.`);
        emptyTracks.forEach(t => console.log(`- [${t.id}] ${t.name}`));

        // 2. Delete them
        const ids = emptyTracks.map(t => t.id);
        if (ids.length > 0) {
            const placeholders = ids.map(() => '?').join(',');
            await query(`DELETE FROM paper_tracks WHERE id IN (${placeholders})`, ids);
            console.log(`Successfully deleted ${ids.length} tracks.`);
        }

        process.exit(0);

    } catch (error) {
        console.error('Error deleting empty tracks:', error);
        process.exit(1);
    }
}

deleteEmptyTracks();
