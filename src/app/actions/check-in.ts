'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface CheckInResult {
    success: boolean;
    message?: string;
    registration?: any;
    error?: string;
}

export async function getRegistrationForCheckIn(code: string): Promise<CheckInResult> {
    try {
        // Clean the input: remove '#' if present, trim whitespace
        const cleanCode = code.replace('#', '').trim();
        const id = parseInt(cleanCode);

        if (isNaN(id)) {
            return { success: false, error: 'Invalid Registration ID format' };
        }

        const result = await query(
            `SELECT r.*, 
                    u.first_name, u.last_name, u.email, u.title, u.profile_image,
                    t.name as ticket_name,
                    e.name_en as event_name
             FROM registrations r
             JOIN users u ON r.user_id = u.id
             JOIN tickets t ON r.ticket_id = t.id
             JOIN events e ON t.event_id = e.id
             WHERE r.id = ?`,
            [id]
        ) as any[];

        if (result.length === 0) {
            return { success: false, error: 'Registration not found' };
        }

        return { success: true, registration: result[0] };
    } catch (error) {
        console.error('Check-in lookup error:', error);
        return { success: false, error: 'Database error occurred' };
    }
}

export async function checkInUser(registrationId: number): Promise<CheckInResult> {
    try {
        // Check current status first
        const check = await query('SELECT status, checked_in_at FROM registrations WHERE id = ?', [registrationId]) as any[];

        if (check.length === 0) {
            return { success: false, error: 'Registration not found' };
        }

        const reg = check[0];

        if (reg.status !== 'paid') {
            return { success: false, error: 'Cannot check in: Registration is not confirmed (Status: ' + reg.status + ')' };
        }

        if (reg.checked_in_at) {
            return { success: false, error: 'User already checked in at ' + new Date(reg.checked_in_at).toLocaleTimeString() };
        }

        // Perform Check-in
        await query('UPDATE registrations SET checked_in_at = NOW() WHERE id = ?', [registrationId]);

        // Fetch updated data to confirm
        const updated = await query(
            `SELECT r.*, u.first_name, u.last_name, t.name as ticket_name 
             FROM registrations r
             JOIN users u ON r.user_id = u.id
             JOIN tickets t ON r.ticket_id = t.id
             WHERE r.id = ?`,
            [registrationId]
        ) as any[];

        return {
            success: true,
            message: 'Check-in Successful',
            registration: updated[0]
        };
    } catch (error) {
        console.error('Check-in execution error:', error);
        return { success: false, error: 'Failed to record check-in' };
    }
}

export async function undoCheckIn(registrationId: number): Promise<CheckInResult> {
    try {
        // Verify registration exists and is checked in
        const check = await query('SELECT id, checked_in_at FROM registrations WHERE id = ?', [registrationId]) as any[];

        if (check.length === 0) {
            return { success: false, error: 'Registration not found' };
        }

        if (!check[0].checked_in_at) {
            return { success: false, error: 'User is not checked in' };
        }

        // Undo check-in by setting checked_in_at to NULL
        await query('UPDATE registrations SET checked_in_at = NULL WHERE id = ?', [registrationId]);

        revalidatePath('/admin/conference/check-in-list');
        revalidatePath('/admin/check-in-list');

        return {
            success: true,
            message: 'Check-in has been undone successfully'
        };
    } catch (error) {
        console.error('Undo check-in error:', error);
        return { success: false, error: 'Failed to undo check-in' };
    }
}
