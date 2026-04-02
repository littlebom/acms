'use server';

import { query } from '@/lib/db';
import { REGISTRATION_BASE_JOIN } from '@/lib/sql-fragments';

export interface Attendee {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    title?: string;
    profile_image?: string;
    ticket_id: number;
    ticket_name: string;
    event_id: number;
    event_name: string;
    status: string;
    registered_at: string;
    checked_in_at: string | null;
}

export async function getAttendees(eventId?: number): Promise<Attendee[]> {
    try {
        let sql = `
            SELECT 
                r.id,
                r.user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.title,
                u.profile_image,
                r.ticket_id,
                t.name as ticket_name,
                t.event_id,
                e.name_en as event_name,
                r.status,
                r.registered_at,
                r.checked_in_at
            ${REGISTRATION_BASE_JOIN}
            JOIN events e ON t.event_id = e.id
            WHERE r.status != 'cancelled'
        `;

        const params: any[] = [];

        if (eventId) {
            sql += ` AND t.event_id = ?`;
            params.push(eventId);
        }

        sql += ` ORDER BY r.checked_in_at DESC, r.registered_at DESC`;

        return await query(sql, params) as Attendee[];
    } catch (error) {
        console.error('Error fetching attendees:', error);
        return [];
    }
}

export async function getAttendeeStats(eventId?: number) {
    try {
        let whereClause = `WHERE r.status != 'cancelled'`;
        const params: any[] = [];

        if (eventId) {
            whereClause += ` AND t.event_id = ?`;
            params.push(eventId);
        }

        const stats = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN r.status = 'paid' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN r.checked_in_at IS NOT NULL THEN 1 ELSE 0 END) as checked_in
            FROM registrations r
            JOIN tickets t ON r.ticket_id = t.id
            ${whereClause}
        `, params) as any[];

        return stats[0] || { total: 0, confirmed: 0, pending: 0, checked_in: 0 };
    } catch (error) {
        console.error('Error fetching attendee stats:', error);
        return { total: 0, confirmed: 0, pending: 0, checked_in: 0 };
    }
}
