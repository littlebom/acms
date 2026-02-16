'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getEvent } from './events';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { parseISO, addDays, differenceInCalendarDays, isSameDay } from 'date-fns';


export interface SessionSpeaker {
    id: number;
    first_name: string;
    last_name: string;
    profile_image: string | null;
    email?: string;
}

export interface SessionAttachment {
    id: number;
    file_name: string;
    file_url: string;
    file_type: string;
}

export interface Session {
    id: number;
    schedule_id: number;
    title: string;
    description: string | null;
    start_time: Date;
    end_time: Date;
    room: string | null;
    type: 'keynote' | 'panel' | 'workshop' | 'presentation' | 'break';
    chair: SessionSpeaker | null;
    speakers: SessionSpeaker[];
    attachments: SessionAttachment[];
}

export interface ScheduleSettings {
    days: string[]; // ["2025-12-10", "2025-12-11"]
    rooms: string[]; // ["Grand Hall", "Room A"]
}

export interface Schedule {
    id: number;
    title: string;
    description: string | null;
    settings: ScheduleSettings | null;
    event_id: number | null;
    event_title?: string; // For display
    session_count?: number;
}

// --- Schedules ---

export async function getSchedules() {
    const schedules = await query(`
        SELECT s.*, e.name_en as event_title, COUNT(sess.id) as session_count 
        FROM schedules s
        LEFT JOIN events e ON s.event_id = e.id
        LEFT JOIN sessions sess ON s.id = sess.schedule_id
        GROUP BY s.id
        ORDER BY s.id DESC
    `) as Schedule[];
    return schedules;
}

export async function getSchedule(id: number) {
    const schedules = await query(`
        SELECT s.*, e.name_en as event_title 
        FROM schedules s
        LEFT JOIN events e ON s.event_id = e.id
        WHERE s.id = ?
    `, [id]) as Schedule[];
    return schedules.length > 0 ? schedules[0] : null;
}

export async function createSchedule(formData: FormData) {
    const title = (formData.get('title') as string) || 'Untitled Schedule';
    const description = (formData.get('description') as string) || '';

    try {
        // Create standalone Schedule
        const result = await query(
            'INSERT INTO schedules (title, description, event_id) VALUES (?, ?, NULL)',
            [title, description]
        ) as any;

        const scheduleId = result.insertId;

        revalidatePath('/admin/conference/schedule');
        return { success: true, scheduleId };
    } catch (error) {
        console.error('Create schedule error:', error);
        return { error: 'Failed to create schedule' };
    }
}

export async function updateSchedule(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const eventId = parseInt(formData.get('event_id') as string);

    // Fetch event name to generate/update schedule title (optional, or let user edit title freely)
    // For now, let's assume we want to sync them or just update what's passed.
    // However, the Create logic auto-generates title. 
    // Let's assume the user might want to change the Event associated.

    // We need to fetch the current schedule to know previous event_id if we want to unlink it.
    const currentSchedule = await getSchedule(id);

    try {
        const events = await query('SELECT name_en FROM events WHERE id = ?', [eventId]) as { name_en: string }[];
        if (events.length === 0) return { error: 'Event not found' };

        // If user didn't provide title/desc, maybe keep old ones? 
        // Or actually, `createSchedule` generates them. `ScheduleList` doesn't seem to have fields for them in Create. 
        // But `ScheduleEditor` displays them.
        // Let's assume we are just swapping the event for now as that's the main link, 
        // or if we add a form to edit them. 
        // The request is "Add edit button". Usually this means editing the properties.

        // Let's allow updating title and description if provided?
        // But simpler: just update the properties.

        // Wait, `createSchedule` takes `event_id` and GENERATES title/desc. 
        // If I make an Edit form, I should probably expose Title/Description inputs.

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;

        // 1. Update Schedule
        await query(
            'UPDATE schedules SET title = ?, description = ?, event_id = ? WHERE id = ?',
            [title, description, eventId, id]
        );

        // 2. Link mechanism
        if (currentSchedule?.event_id !== eventId) {
            // Unlink old event
            if (currentSchedule?.event_id) {
                await query('UPDATE events SET schedule_id = NULL WHERE id = ?', [currentSchedule.event_id]);
            }
            // Link new event
            await query('UPDATE events SET schedule_id = ? WHERE id = ?', [id, eventId]);
        }

        revalidatePath('/admin/schedule');
        return { success: true };
    } catch (error) {
        console.error('Update schedule error:', error);
        return { error: 'Failed to update schedule' };
    }
}

export async function updateScheduleSettings(id: number, settings: ScheduleSettings) {
    try {
        await query(
            'UPDATE schedules SET settings = ? WHERE id = ?',
            [JSON.stringify(settings), id]
        );
        revalidatePath(`/admin/schedule/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Update schedule settings error:', error);
        return { error: 'Failed to update schedule settings' };
    }
}

export async function renameRoom(scheduleId: number, oldName: string, newName: string) {
    try {
        // 1. Get current settings
        const schedule = await getSchedule(scheduleId);
        if (!schedule) return { error: 'Schedule not found' };

        const settings: ScheduleSettings = typeof schedule.settings === 'string'
            ? JSON.parse(schedule.settings)
            : (schedule.settings || { days: [], rooms: [] });

        // 2. Update settings
        const newSettings = {
            ...settings,
            rooms: settings.rooms.map(r => r === oldName ? newName : r)
        };

        // 3. Update DB Settings
        await query(
            'UPDATE schedules SET settings = ? WHERE id = ?',
            [JSON.stringify(newSettings), scheduleId]
        );

        // 4. Update Sessions
        await query(
            'UPDATE sessions SET room = ? WHERE schedule_id = ? AND room = ?',
            [newName, scheduleId, oldName]
        );

        revalidatePath(`/admin/schedule/${scheduleId}`);
        return { success: true };
    } catch (error) {
        console.error('Rename room error:', error);
        return { error: 'Failed to rename room' };
    }
}

export async function deleteSchedule(id: number) {
    try {
        // Optional: Unlink from event first (though ON DELETE SET NULL might handle it if FK exists on event side, but usually event->schedule is FK)
        // Check if event has this schedule
        await query('UPDATE events SET schedule_id = NULL WHERE schedule_id = ?', [id]);
        await query('DELETE FROM schedules WHERE id = ?', [id]);
        revalidatePath('/admin/schedule');
        return { success: true };
    } catch (error) {
        console.error('Delete schedule error:', error);
        return { error: 'Failed to delete schedule' };
    }
}

// --- Sessions ---

export async function getSessions(scheduleId: number) {
    // 1. Get Sessions with Chair info
    const sessions = await query(`
        SELECT s.*, 
            uc.id as chair_uid, uc.first_name as chair_first, uc.last_name as chair_last, uc.profile_image as chair_image, uc.email as chair_email
        FROM sessions s
        LEFT JOIN users uc ON s.chair_id = uc.id
        WHERE s.schedule_id = ? 
        ORDER BY s.start_time ASC
    `, [scheduleId]) as any[];

    if (sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);

        // 2. Get Speakers
        // Removed display_order from query as it doesn't exist in DB
        const speakersQuery = `
            SELECT ss.session_id, u.id, u.first_name, u.last_name, u.email, u.profile_image
            FROM session_speakers ss
            JOIN users u ON ss.user_id = u.id
            WHERE ss.session_id IN (${sessionIds.map(() => '?').join(',')})
        `;
        const speakers = await query(speakersQuery, sessionIds) as (SessionSpeaker & { session_id: number })[];

        // 3. Get Attachments
        const attachmentsQuery = `
            SELECT * FROM session_attachments 
            WHERE session_id IN (${sessionIds.map(() => '?').join(',')})
        `;
        const attachments = await query(attachmentsQuery, sessionIds) as (SessionAttachment & { session_id: number })[];

        // 4. Map data to sessions
        const speakersMap: Record<number, SessionSpeaker[]> = {};
        speakers.forEach(s => {
            if (!speakersMap[s.session_id]) speakersMap[s.session_id] = [];
            speakersMap[s.session_id].push({
                id: s.id,
                first_name: s.first_name,
                last_name: s.last_name,
                email: s.email,
                profile_image: s.profile_image
            });
        });

        const attachmentsMap: Record<number, SessionAttachment[]> = {};
        attachments.forEach(a => {
            if (!attachmentsMap[a.session_id]) attachmentsMap[a.session_id] = [];
            attachmentsMap[a.session_id].push({
                id: a.id,
                file_name: a.file_name,
                file_url: a.file_url,
                file_type: a.file_type
            });
        });

        sessions.forEach(s => {
            s.speakers = speakersMap[s.id] || [];
            s.attachments = attachmentsMap[s.id] || [];

            // Map chair
            if (s.chair_uid) {
                s.chair = {
                    id: s.chair_uid,
                    first_name: s.chair_first,
                    last_name: s.chair_last,
                    profile_image: s.chair_image,
                    email: s.chair_email
                };
            } else {
                s.chair = null;
            }
        });
    } else {
        sessions.forEach(s => {
            s.speakers = [];
            s.attachments = [];
            s.chair = null;
        });
    }

    return sessions as Session[];
}

// Helper to get speakers available for a specific schedule (includes all speakers/chairs + group members)
export async function getScheduleAvailableSpeakers(scheduleId: number) {
    try {
        // 1. Get all users with speaker or chair role (Global pool)
        const globalSpeakers = await query(`
            SELECT id, first_name, last_name, email, profile_image
            FROM users
            WHERE role IN ('speaker', 'chair')
        `) as SessionSpeaker[];

        // 2. Find Event for this Schedule to get group members
        const schedule = await getSchedule(scheduleId);
        if (!schedule || !schedule.event_id) return globalSpeakers;

        // 3. Find Speaker Group for this Event
        const events = await query('SELECT speaker_group_id FROM events WHERE id = ?', [schedule.event_id]) as { speaker_group_id: number }[];

        let groupMembers: SessionSpeaker[] = [];
        if (events.length > 0 && events[0].speaker_group_id) {
            const groupId = events[0].speaker_group_id;
            // 4. Get Members of that Group
            groupMembers = await query(`
                SELECT u.id, u.first_name, u.last_name, u.email, u.profile_image
                FROM speaker_group_members sgm
                JOIN users u ON sgm.user_id = u.id
                WHERE sgm.group_id = ?
            `, [groupId]) as SessionSpeaker[];
        }

        // Combine and deduplicate using a Map
        const allSpeakersMap = new Map<number, SessionSpeaker>();
        globalSpeakers.forEach(s => allSpeakersMap.set(s.id, s));
        groupMembers.forEach(s => allSpeakersMap.set(s.id, s));

        return Array.from(allSpeakersMap.values()).sort((a, b) =>
            (a.first_name || '').localeCompare(b.first_name || '')
        );
    } catch (error) {
        console.error('Error fetching schedule available speakers:', error);
        return [];
    }
}

export async function createSession(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const start_time = new Date(formData.get('start_time') as string);
    const end_time = new Date(formData.get('end_time') as string);
    const room = formData.get('room') as string;
    const type = formData.get('type') as string;
    const chair_id = formData.get('chair_id') ? parseInt(formData.get('chair_id') as string) : null;
    const schedule_id = parseInt(formData.get('schedule_id') as string);
    const speakerIds = formData.getAll('speakers').map(id => parseInt(id as string));
    const files = formData.getAll('files') as File[];

    try {
        const result = await query(
            `INSERT INTO sessions (schedule_id, title, description, start_time, end_time, room, type, chair_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [schedule_id, title, description, start_time, end_time, room, type, chair_id]
        ) as any;

        const sessionId = result.insertId;

        // Insert speakers (Removed display_order)
        if (speakerIds.length > 0) {
            const values = speakerIds.map((userId) => [sessionId, userId]);
            await query(
                'INSERT INTO session_speakers (session_id, user_id) VALUES ?',
                [values]
            );
        }

        // Handle File Uploads
        for (const file of files) {
            if (file.size > 0) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${Date.now()}-${file.name}`;
                const path = join(process.cwd(), 'public/uploads', fileName);

                await writeFile(path, buffer);
                const fileUrl = `/uploads/${fileName}`;

                await query(
                    'INSERT INTO session_attachments (session_id, file_name, file_url, file_type) VALUES (?, ?, ?, ?)',
                    [sessionId, file.name, fileUrl, file.type]
                );
            }
        }

        revalidatePath(`/admin/schedule/${schedule_id}`);
        return { success: true };
    } catch (error) {
        console.error('Create session error:', error);
        return { error: 'Failed to create session' };
    }
}

export async function updateSession(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const schedule_id = formData.get('schedule_id'); // Needed for revalidate
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const start_time = new Date(formData.get('start_time') as string);
    const end_time = new Date(formData.get('end_time') as string);
    const room = formData.get('room') as string;
    const type = formData.get('type') as string;
    const chair_id = formData.get('chair_id') ? parseInt(formData.get('chair_id') as string) : null;
    const speakerIds = formData.getAll('speakers').map(id => parseInt(id as string));
    const files = formData.getAll('files') as File[];

    try {
        await query(
            `UPDATE sessions SET 
                title = ?, description = ?, start_time = ?, end_time = ?, room = ?, type = ?, chair_id = ?
             WHERE id = ?`,
            [title, description, start_time, end_time, room, type, chair_id, id]
        );

        // Update speakers
        await query('DELETE FROM session_speakers WHERE session_id = ?', [id]);

        if (speakerIds.length > 0) {
            for (const userId of speakerIds) {
                await query(
                    'INSERT INTO session_speakers (session_id, user_id) VALUES (?, ?)',
                    [id, userId]
                );
            }
        }

        // Handle New File Uploads (Append)
        for (const file of files) {
            if (file.size > 0) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const fileName = `${Date.now()}-${file.name}`;
                const path = join(process.cwd(), 'public/uploads', fileName);

                await writeFile(path, buffer);
                const fileUrl = `/uploads/${fileName}`;

                await query(
                    'INSERT INTO session_attachments (session_id, file_name, file_url, file_type) VALUES (?, ?, ?, ?)',
                    [id, file.name, fileUrl, file.type]
                );
            }
        }

        revalidatePath(`/admin/schedule/${schedule_id}`);
        return { success: true };
    } catch (error) {
        console.error('Update session error:', error);
        return { error: 'Failed to update session' };
    }
}

export async function deleteSessionAttachment(attachmentId: number, scheduleId: number) {
    try {
        // In a real app, delete file from disk too
        await query('DELETE FROM session_attachments WHERE id = ?', [attachmentId]);
        revalidatePath(`/admin/schedule/${scheduleId}`);
        return { success: true };
    } catch (error) {
        console.error('Delete attachment error:', error);
        return { error: 'Failed to delete attachment' };
    }
}

export async function deleteSession(id: number) {
    try {
        await query('DELETE FROM sessions WHERE id = ?', [id]);
        // revalidatePath is tricky without schedule_id, but page refresh handles it
        return { success: true };
    } catch (error) {
        console.error('Delete session error:', error);
        return { error: 'Failed to delete session' };
    }
}

export async function swapSessionTimes(sessionAId: number, sessionBId: number) {
    try {
        const sessionA = (await query('SELECT * FROM sessions WHERE id = ?', [sessionAId]) as Session[])[0];
        const sessionB = (await query('SELECT * FROM sessions WHERE id = ?', [sessionBId]) as Session[])[0];

        if (!sessionA || !sessionB) return { error: 'Session not found' };

        // Swap start and end times
        const newStartA = sessionB.start_time;
        const newEndA = sessionB.end_time;
        const newStartB = sessionA.start_time;
        const newEndB = sessionA.end_time;

        // Optimistic check: if sessions are on different days or rooms?
        // User said "exchange time", implying we just swap slots.
        // It's safest to just swap times.

        await query('UPDATE sessions SET start_time = ?, end_time = ? WHERE id = ?', [newStartA, newEndA, sessionAId]);
        await query('UPDATE sessions SET start_time = ?, end_time = ? WHERE id = ?', [newStartB, newEndB, sessionBId]);

        revalidatePath(`/admin/conference/schedule/${sessionA.schedule_id}`);
        return { success: true };
    } catch (error) {
        console.error('Swap session times error:', error);
        return { error: 'Failed to swap session times' };
    }
}

export async function moveSessionsToNewDate(scheduleId: number, oldDateStr: string, newDateStr: string) {
    try {
        const sessions = await query('SELECT * FROM sessions WHERE schedule_id = ?', [scheduleId]) as Session[];

        const oldDate = parseISO(oldDateStr);
        const newDate = parseISO(newDateStr);

        // Calculate day difference
        const daysDiff = differenceInCalendarDays(newDate, oldDate);

        if (daysDiff === 0) return { success: true };

        // Finds sessions on oldDate
        // Note: This runs on Server. If Server TZ != User TZ, 'isSameDay' might mismatch user perception.
        // However, standard Next.js deployment usually syncs or we assume consistent dates.
        // For '2025-05-20', we look for sessions that match that day.

        const sessionsToMove = sessions.filter(s => isSameDay(new Date(s.start_time), oldDate));

        for (const session of sessionsToMove) {
            const newStart = addDays(new Date(session.start_time), daysDiff);
            const newEnd = addDays(new Date(session.end_time), daysDiff);

            await query(
                'UPDATE sessions SET start_time = ?, end_time = ? WHERE id = ?',
                [newStart, newEnd, session.id]
            );
        }

        revalidatePath(`/admin/conference/schedule/${scheduleId}`);
        return { success: true };
    } catch (error) {
        console.error('Move sessions date error:', error);
        return { error: 'Failed to move sessions to new date' };
    }
}
