'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { submitAnswers } from './questions';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function getUserRegistration(eventId?: number) {
    const session = await getSession();
    if (!session) return null;

    let sql = `SELECT r.*, 
                t.name as ticket_name, t.price as ticket_price, t.background_image as ticket_background_image,
                u.title, u.first_name, u.last_name, u.email
         FROM registrations r
         JOIN tickets t ON r.ticket_id = t.id
         JOIN users u ON r.user_id = u.id
         WHERE r.user_id = ? AND r.status != 'cancelled'`;

    const params: any[] = [session.userId];

    if (eventId) {
        sql += ` AND t.event_id = ?`;
        params.push(eventId);
    }

    sql += ` LIMIT 1`;

    const registrations = await query(sql, params) as any[];

    if (registrations.length > 0) {
        return registrations[0];
    }
    return null;
}

export async function getAvailableTickets(eventId?: number) {
    let sql = `
        SELECT t.*, COUNT(r.id) as sold_count 
        FROM tickets t
        LEFT JOIN registrations r ON t.id = r.ticket_id AND r.status != 'cancelled'
        WHERE (t.available_until IS NULL OR t.available_until > NOW())
    `;
    const params: any[] = [];

    if (eventId) {
        sql += ` AND t.event_id = ?`;
        params.push(eventId);
    }

    sql += `
        GROUP BY t.id
        HAVING (t.quota IS NULL OR sold_count < t.quota)
        ORDER BY t.price ASC
    `;

    const tickets = await query(sql, params) as any[];
    return tickets;
}

export async function registerForEvent(formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const ticketId = formData.get('ticketId');
    const eventIdStr = formData.get('eventId');

    if (!ticketId) {
        return { error: 'Please select a ticket' };
    }

    try {
        // Check if already registered
        const existing = await getUserRegistration();
        if (existing) {
            return { error: 'You are already registered for this event' };
        }

        // Check ticket details (price)
        const ticket = await query('SELECT price FROM tickets WHERE id = ?', [ticketId]) as { price: number }[];
        if (ticket.length === 0) {
            return { error: 'Invalid ticket' };
        }

        const isFree = Number(ticket[0].price) === 0;
        const initialStatus = isFree ? 'paid' : 'pending';

        // Create registration
        // For free tickets, set approved_at to mark them as auto-approved by system
        if (isFree) {
            await query(
                `INSERT INTO registrations (user_id, ticket_id, status, registered_at, approved_at)
                 VALUES (?, ?, ?, NOW(), NOW())`,
                [session.userId, ticketId, initialStatus]
            );
        } else {
            await query(
                `INSERT INTO registrations (user_id, ticket_id, status, registered_at)
                 VALUES (?, ?, ?, NOW())`,
                [session.userId, ticketId, initialStatus]
            );
        }

        // Handle Answers if eventId is provided
        if (eventIdStr) {
            const eventId = parseInt(eventIdStr as string);
            const answers: { questionId: number, answer: string }[] = [];

            // Iterate over formData keys to find answers
            for (const [key, value] of Array.from(formData.entries())) {
                if (key.startsWith('answer_')) {
                    const questionId = parseInt(key.replace('answer_', ''));
                    const existingAnswer = answers.find(a => a.questionId === questionId);
                    if (existingAnswer) {
                        existingAnswer.answer += `, ${value}`;
                    } else {
                        answers.push({ questionId, answer: value as string });
                    }
                }
            }

            if (answers.length > 0) {
                await submitAnswers(eventId, answers);
            }
        }

        revalidatePath('/register-conference');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Failed to register' };
    }
}

export async function cancelRegistration(registrationId: number) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        // Verify ownership
        const reg = await query(
            'SELECT user_id FROM registrations WHERE id = ?',
            [registrationId]
        ) as any[];

        if (reg.length === 0 || reg[0].user_id !== session.userId) {
            return { error: 'Unauthorized' };
        }

        await query(
            "UPDATE registrations SET status = 'cancelled' WHERE id = ?",
            [registrationId]
        );

        revalidatePath('/register-conference');
        return { success: true };
    } catch (error) {
        console.error('Cancel registration error:', error);
        return { error: 'Failed to cancel registration' };
    }
}

export async function uploadPaymentProof(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const file = formData.get('slip') as File;
    const registrationId = formData.get('registrationId');

    if (!file || !registrationId) {
        return { error: 'Missing file or registration ID' };
    }

    // Verify ownership
    const reg = await query(
        'SELECT user_id FROM registrations WHERE id = ?',
        [registrationId]
    ) as any[];

    if (reg.length === 0 || reg[0].user_id !== session.userId) {
        return { error: 'Unauthorized' };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const ext = file.name.split('.').pop();
        const filename = `slip-${registrationId}-${Date.now()}.${ext}`;
        const path = join(process.cwd(), 'public/uploads/slips', filename);

        await writeFile(path, buffer);

        const url = `/uploads/slips/${filename}`;

        await query(
            'UPDATE registrations SET payment_proof_url = ? WHERE id = ?',
            [url, registrationId]
        );

        revalidatePath('/register-conference');
        return { success: true };
    } catch (error) {
        console.error('Upload slip error:', error);
        return { error: 'Failed to upload payment slip' };
    }
}
