'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

// --- Tickets ---

export interface Ticket {
    id: number;
    event_id: number;
    name: string;
    price: number;
    quota: number | null;
    available_until: Date | null;
    background_image: string | null;
    // Calculated field
    sold_count?: number;
}

export async function getTickets() {
    const tickets = await query(`
        SELECT t.*, COUNT(r.id) as sold_count 
        FROM tickets t
        LEFT JOIN registrations r ON t.id = r.ticket_id AND r.status != 'cancelled'
        GROUP BY t.id
        ORDER BY t.price ASC
    `) as Ticket[];
    return tickets;
}

export async function createTicket(formData: FormData) {
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const quota = formData.get('quota') ? parseInt(formData.get('quota') as string) : null;
    const available_until = formData.get('available_until') ? new Date(formData.get('available_until') as string) : null;
    const background_image = formData.get('background_image') as string | null;

    // Get event ID (assuming single event)
    const events = await query('SELECT id FROM events LIMIT 1') as { id: number }[];
    const event_id = events.length > 0 ? events[0].id : 1;

    try {
        await query(
            `INSERT INTO tickets (event_id, name, price, quota, available_until, background_image)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [event_id, name, price, quota, available_until, background_image]
        );
        revalidatePath('/admin/conference/registrations');
        revalidatePath('/admin/conference/tickets');
        return { success: true };
    } catch (error) {
        console.error('Create ticket error:', error);
        return { error: 'Failed to create ticket' };
    }
}

export async function updateTicket(formData: FormData) {
    const id = formData.get('id');
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const quota = formData.get('quota') ? parseInt(formData.get('quota') as string) : null;
    const available_until = formData.get('available_until') ? new Date(formData.get('available_until') as string) : null;
    const background_image = formData.get('background_image') as string | null;

    try {
        await query(
            `UPDATE tickets SET 
                name = ?, price = ?, quota = ?, available_until = ?, background_image = ?
             WHERE id = ?`,
            [name, price, quota, available_until, background_image, id]
        );
        revalidatePath('/admin/conference/registrations');
        revalidatePath('/admin/conference/tickets');
        return { success: true };
    } catch (error) {
        console.error('Update ticket error:', error);
        return { error: 'Failed to update ticket' };
    }
}

export async function deleteTicket(id: number) {
    try {
        // Check if has registrations
        const registrations = await query('SELECT id FROM registrations WHERE ticket_id = ?', [id]) as any[];
        if (registrations.length > 0) {
            return { error: 'Cannot delete ticket with existing registrations' };
        }

        await query('DELETE FROM tickets WHERE id = ?', [id]);
        revalidatePath('/admin/conference/registrations');
        return { success: true };
    } catch (error) {
        console.error('Delete ticket error:', error);
        return { error: 'Failed to delete ticket' };
    }
}

// --- Registrations ---

export interface Registration {
    id: number;
    user_id: number;
    ticket_id: number;
    status: 'pending' | 'paid' | 'cancelled';
    payment_proof_url: string | null;
    registered_at: Date;
    approved_by: number | null;
    approved_at: Date | null;
    // Joined fields
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string | null;
    ticket_name: string;
    ticket_price: number;
    ticket_background_image?: string | null;
    title?: string;
    approver_name?: string | null; // Name of the person who approved, or null for system
}

export async function getRegistrations(eventId?: number) {
    let sql = `
        SELECT r.*, 
               u.title, u.first_name, u.last_name, u.email, u.profile_image,
               t.name as ticket_name, t.price as ticket_price, t.background_image as ticket_background_image,
               CASE 
                   WHEN r.approved_by IS NULL AND r.status = 'paid' THEN 'Auto System'
                   WHEN r.approved_by IS NOT NULL THEN CONCAT(approver.first_name, ' ', approver.last_name)
                   ELSE NULL 
               END as approver_name
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        JOIN tickets t ON r.ticket_id = t.id
        LEFT JOIN users approver ON r.approved_by = approver.id
        WHERE 1=1
    `;

    const params: any[] = [];
    if (eventId) {
        sql += ' AND t.event_id = ?';
        params.push(eventId);
    }

    sql += ' ORDER BY r.registered_at DESC';

    const registrations = await query(sql, params) as Registration[];
    return registrations;
}

export async function updateRegistrationStatus(id: number, status: string, approverId?: number) {
    try {
        if (status === 'paid') {
            // Record who approved and when
            await query(
                'UPDATE registrations SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
                [status, approverId || null, id]
            );
        } else {
            // For other statuses, just update status
            await query('UPDATE registrations SET status = ? WHERE id = ?', [status, id]);
        }
        revalidatePath('/admin/conference/registrations');
        return { success: true };
    } catch (error) {
        console.error('Update registration status error:', error);
        return { error: 'Failed to update status' };
    }
}

export async function deleteRegistration(id: number) {
    try {
        await query('DELETE FROM registrations WHERE id = ?', [id]);
        revalidatePath('/admin/conference/registrations');
        return { success: true };
    } catch (error) {
        console.error('Delete registration error:', error);
        return { error: 'Failed to delete registration' };
    }
}
