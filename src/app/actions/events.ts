'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

export interface EventData {
    id: number;
    title: string; // Alias for name_en for frontend compatibility
    name_en: string;
    proceedings_name: string | null;
    name_th: string | null;
    short_description: string | null;
    description: string | null;
    venue_name: string | null;
    venue_map_url: string | null;
    cover_image_url: string | null;
    address: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    social_facebook: string | null;
    social_line: string | null;
    social_website: string | null;
    start_date: Date | null;
    end_date: Date | null;
    registration_start_date: Date | null;
    submission_deadline: Date | null;
    registration_deadline: Date | null;
    review_deadline: Date | null;
    registration_form_id: number | null;
    speaker_group_id: number | null;
    schedule_id: number | null;
    slug: string;
    is_active: boolean;
    youtube_url: string | null;
}

// Get all events for the list
export async function getEvents() {
    const events = await query('SELECT *, name_en as title FROM events ORDER BY start_date DESC') as EventData[];
    return events;
}

// Get all events available for registration (future events)
export async function getAvailableEvents() {
    return await query(`
        SELECT *, name_en as title 
        FROM events 
        WHERE (registration_deadline IS NULL OR registration_deadline >= CURDATE())
        AND (end_date IS NULL OR end_date >= CURDATE())
        ORDER BY start_date ASC
    `) as EventData[];
}

// Get a single event (by ID or the active one)
export async function getEvent(id?: number) {
    let sql = 'SELECT *, name_en as title FROM events';
    const params: any[] = [];

    if (id) {
        sql += ' WHERE id = ?';
        params.push(id);
    } else {
        // If no ID, get the active event
        sql += ' WHERE is_active = TRUE LIMIT 1';
    }

    const events = await query(sql, params) as EventData[];

    // Fallback: If no active event found, return the latest one
    if (!id && events.length === 0) {
        const latest = await query('SELECT *, name_en as title FROM events ORDER BY id DESC LIMIT 1') as EventData[];
        return latest.length > 0 ? latest[0] : null;
    }

    return events.length > 0 ? events[0] : null;
}

export async function getEventBySlug(slug: string) {
    const events = await query('SELECT *, name_en as title FROM events WHERE slug = ?', [slug]) as EventData[];
    return events.length > 0 ? events[0] : null;
}

export async function createEvent(formData: FormData) {
    const name_en = formData.get('name_en') as string;
    const name_th = formData.get('name_th') as string;
    const short_description = formData.get('short_description') as string;
    const description = formData.get('description') as string;
    const venue_name = formData.get('venue_name') as string;
    const venue_map_url = formData.get('venue_map_url') as string;
    const cover_image_url = formData.get('cover_image_url') as string;
    const youtube_url = formData.get('youtube_url') as string;

    // Contact Info
    const address = formData.get('address') as string;
    const contact_phone = formData.get('contact_phone') as string;
    const contact_email = formData.get('contact_email') as string;
    const social_facebook = formData.get('social_facebook') as string;
    const social_line = formData.get('social_line') as string;
    const social_website = formData.get('social_website') as string;

    const slug = (formData.get('slug') as string) || `event-${Date.now()}`;
    const proceedings_name = formData.get('proceedings_name') as string;

    const parseId = (key: string) => {
        const val = formData.get(key);
        return val && val !== 'none' ? parseInt(val as string) : null;
    };

    const registration_form_id = parseId('registration_form_id');
    const speaker_group_id = parseId('speaker_group_id');
    const schedule_id = parseId('schedule_id');

    const parseDate = (val: FormDataEntryValue | null) => val ? new Date(val as string) : null;

    const start_date = parseDate(formData.get('start_date'));
    const end_date = parseDate(formData.get('end_date'));
    const registration_start_date = parseDate(formData.get('registration_start_date'));
    const submission_deadline = parseDate(formData.get('submission_deadline'));
    const registration_deadline = parseDate(formData.get('registration_deadline'));
    const review_deadline = parseDate(formData.get('review_deadline'));

    try {
        await query(
            `INSERT INTO events (
                name_en, name_th, short_description, description, 
                venue_name, venue_map_url, cover_image_url,
                address, contact_phone, contact_email,
                social_facebook, social_line, social_website,
                start_date, end_date,
                registration_start_date, submission_deadline, registration_deadline, review_deadline,
                registration_form_id, speaker_group_id, schedule_id,
                slug,
                proceedings_name,
                is_active,
                youtube_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, ?)`,
            [
                name_en, name_th, short_description, description,
                venue_name, venue_map_url, cover_image_url,
                address, contact_phone, contact_email,
                social_facebook, social_line, social_website,
                start_date, end_date,
                registration_start_date, submission_deadline, registration_deadline, review_deadline,
                registration_form_id, speaker_group_id, schedule_id,
                slug,
                proceedings_name,
                youtube_url
            ]
        );
        revalidatePath('/admin/conference/events');
        return { success: true };
    } catch (error) {
        console.error('Create event error:', error);
        return { error: 'Failed to create event' };
    }
}

export async function updateEvent(formData: FormData) {
    const id = formData.get('id');
    const name_en = formData.get('name_en') as string;
    const name_th = formData.get('name_th') as string;
    const short_description = formData.get('short_description') as string;
    const description = formData.get('description') as string;
    const venue_name = formData.get('venue_name') as string;
    const venue_map_url = formData.get('venue_map_url') as string;
    const cover_image_url = formData.get('cover_image_url') as string;
    const youtube_url = formData.get('youtube_url') as string;

    // Contact Info
    const address = formData.get('address') as string;
    const contact_phone = formData.get('contact_phone') as string;
    const contact_email = formData.get('contact_email') as string;
    const social_facebook = formData.get('social_facebook') as string;
    const social_line = formData.get('social_line') as string;
    const social_website = formData.get('social_website') as string;

    const slug = formData.get('slug') as string;
    const proceedings_name = formData.get('proceedings_name') as string;

    const parseId = (key: string) => {
        const val = formData.get(key);
        if (!val || val === 'none') return null;
        const parsed = parseInt(val as string);
        return isNaN(parsed) ? null : parsed;
    };

    const registration_form_id = parseId('registration_form_id');
    const speaker_group_id = parseId('speaker_group_id');
    const schedule_id = parseId('schedule_id');

    const parseDate = (val: FormDataEntryValue | null) => val ? new Date(val as string) : null;

    const start_date = parseDate(formData.get('start_date'));
    const end_date = parseDate(formData.get('end_date'));
    const registration_start_date = parseDate(formData.get('registration_start_date'));
    const submission_deadline = parseDate(formData.get('submission_deadline'));
    const registration_deadline = parseDate(formData.get('registration_deadline'));
    const review_deadline = parseDate(formData.get('review_deadline'));

    try {
        await query(
            `UPDATE events SET 
                name_en = ?, name_th = ?, short_description = ?, description = ?, 
                venue_name = ?, venue_map_url = ?, cover_image_url = ?,
                address = ?, contact_phone = ?, contact_email = ?,
                social_facebook = ?, social_line = ?, social_website = ?,
                start_date = ?, end_date = ?,
                registration_start_date = ?, submission_deadline = ?, registration_deadline = ?, review_deadline = ?,
                registration_form_id = ?, speaker_group_id = ?, schedule_id = ?, slug = ?, proceedings_name = ?,
                youtube_url = ?
                WHERE id = ?`,
            [
                name_en, name_th, short_description, description,
                venue_name, venue_map_url, cover_image_url,
                address, contact_phone, contact_email,
                social_facebook, social_line, social_website,
                start_date, end_date,
                registration_start_date, submission_deadline, registration_deadline, review_deadline,
                registration_form_id, speaker_group_id, schedule_id,
                slug,
                proceedings_name,
                youtube_url,
                id
            ]
        );

        revalidatePath('/admin/conference/events');
        revalidatePath(`/admin/conference/events/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Update event error:', error);
        return { error: 'Failed to update event' };
    }
}

export async function activateEvent(id: number) {
    try {
        // Deactivate all first
        await query('UPDATE events SET is_active = FALSE');
        // Activate the selected one
        await query('UPDATE events SET is_active = TRUE WHERE id = ?', [id]);

        revalidatePath('/admin/conference/events');
        return { success: true };
    } catch (error) {
        console.error('Activate event error:', error);
        return { error: 'Failed to activate event' };
    }
}

export async function deleteEvent(id: number) {
    try {
        await query('DELETE FROM tickets WHERE event_id = ?', [id]);
        await query('DELETE FROM answers WHERE event_id = ?', [id]);
        await query('DELETE FROM event_questions WHERE event_id = ?', [id]);
        await query('DELETE FROM sessions WHERE event_id = ?', [id]);
        await query('DELETE FROM events WHERE id = ?', [id]);

        revalidatePath('/admin/conference/events');
        return { success: true };
    } catch (error) {
        console.error('Delete event error:', error);
        return { error: 'Failed to delete event. Please ensure all related data is removed.' };
    }
}

export async function getEventSpeakers(eventId: number) {
    try {
        const events = await query('SELECT speaker_group_id FROM events WHERE id = ?', [eventId]) as { speaker_group_id: number }[];
        if (events.length === 0 || !events[0].speaker_group_id) return [];
        const groupId = events[0].speaker_group_id;
        const speakers = await query(`
            SELECT u.id, u.first_name, u.last_name, u.title, u.email, u.profile_image, u.bio, u.country, u.organization
            FROM speaker_group_members sgm
            JOIN users u ON sgm.user_id = u.id
            WHERE sgm.group_id = ?
            ORDER BY sgm.display_order ASC, u.id ASC
        `, [groupId]) as any[];
        return speakers;
    } catch (error) {
        console.error('Get event speakers error:', error);
        return [];
    }
}

export async function getEventProceedings(slug: string) {
    const event = await getEventBySlug(slug);
    if (!event) return null;
    const papers = await query(`
        SELECT p.*, t.name as track_name
        FROM papers p
        LEFT JOIN paper_tracks t ON p.track_id = t.id
        WHERE p.event_id = ? 
        AND p.status = 'published'
        ORDER BY t.name ASC, p.title ASC
    `, [event.id]) as any[];
    const papersWithDetails = await Promise.all(papers.map(async (paper) => {
        const authors = await query(
            'SELECT * FROM paper_authors WHERE paper_id = ? ORDER BY author_order ASC',
            [paper.id]
        ) as any[];
        const files = await query(
            "SELECT * FROM paper_files WHERE paper_id = ? AND version_type = 'camera_ready' ORDER BY uploaded_at DESC LIMIT 1",
            [paper.id]
        ) as any[];
        return {
            ...paper,
            authors,
            file: files.length > 0 ? files[0] : null
        };
    }));
    return {
        event,
        papers: papersWithDetails
    };
}
