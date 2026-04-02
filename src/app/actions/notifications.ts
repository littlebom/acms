'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// --- Notifications ---

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'announcement' | 'email' | 'system' | 'reminder';
    target_type: 'all' | 'attendee' | 'speaker' | 'reviewer' | 'author' | 'admin' | 'custom';
    target_user_ids: number[] | null;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    is_email: boolean;
    email_subject: string | null;
    scheduled_at: string | null;
    sent_at: string | null;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    created_by: number | null;
    created_at: string;
    recipients_count?: number;
    read_count?: number;
}

export async function getNotifications(status?: string) {
    let sql = `
        SELECT n.*, 
            COUNT(DISTINCT un.id) as recipients_count,
            SUM(CASE WHEN un.is_read = 1 THEN 1 ELSE 0 END) as read_count,
            u.first_name as creator_first_name,
            u.last_name as creator_last_name
        FROM notifications n
        LEFT JOIN user_notifications un ON n.id = un.notification_id
        LEFT JOIN users u ON n.created_by = u.id
    `;
    const params: any[] = [];

    if (status) {
        sql += ' WHERE n.status = ?';
        params.push(status);
    }

    sql += ' GROUP BY n.id ORDER BY n.created_at DESC';

    const notifications = await query(sql, params) as (Notification & {
        creator_first_name?: string;
        creator_last_name?: string
    })[];

    return notifications;
}

export async function getNotification(id: number) {
    const notifications = await query(
        `SELECT n.*, 
            u.first_name as creator_first_name,
            u.last_name as creator_last_name
         FROM notifications n
         LEFT JOIN users u ON n.created_by = u.id
         WHERE n.id = ?`,
        [id]
    ) as Notification[];
    return notifications.length > 0 ? notifications[0] : null;
}

export async function createNotification(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const type = formData.get('type') as string || 'announcement';
    const target_type = formData.get('target_type') as string || 'all';
    const priority = formData.get('priority') as string || 'normal';
    const is_email = formData.get('is_email') === 'on';
    const email_subject = formData.get('email_subject') as string || null;
    const scheduled_at = formData.get('scheduled_at') as string || null;
    const status = formData.get('status') as string || 'draft';

    try {
        const result = await query(
            `INSERT INTO notifications 
                (title, message, type, target_type, priority, is_email, email_subject, scheduled_at, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, message, type, target_type, priority, is_email, email_subject, scheduled_at || null, status, session.userId]
        ) as any;

        revalidatePath('/admin/notifications');
        return { success: true, id: result.insertId };
    } catch (error) {
        console.error('Create notification error:', error);
        return { error: 'Failed to create notification' };
    }
}

export async function updateNotification(id: number, formData: FormData) {
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    const type = formData.get('type') as string;
    const target_type = formData.get('target_type') as string;
    const priority = formData.get('priority') as string;
    const is_email = formData.get('is_email') === 'on';
    const email_subject = formData.get('email_subject') as string || null;

    try {
        await query(
            `UPDATE notifications SET 
                title = ?, message = ?, type = ?, target_type = ?, 
                priority = ?, is_email = ?, email_subject = ?
             WHERE id = ? AND status IN ('draft', 'scheduled')`,
            [title, message, type, target_type, priority, is_email, email_subject, id]
        );
        revalidatePath('/admin/notifications');
        revalidatePath(`/admin/notifications/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Update notification error:', error);
        return { error: 'Failed to update notification' };
    }
}

export async function deleteNotification(id: number) {
    try {
        await query('DELETE FROM notifications WHERE id = ?', [id]);
        revalidatePath('/admin/notifications');
        return { success: true };
    } catch (error) {
        console.error('Delete notification error:', error);
        return { error: 'Failed to delete notification' };
    }
}

export async function sendNotification(id: number) {
    try {
        // Get notification details
        const notification = await getNotification(id);
        if (!notification) return { error: 'Notification not found' };
        if (notification.status === 'sent') return { error: 'Notification already sent' };

        // Update status to sending
        await query('UPDATE notifications SET status = ? WHERE id = ?', ['sending', id]);

        // Get target users based on target_type
        let usersSql = 'SELECT id, email, first_name, last_name FROM users WHERE 1=1';
        const params: any[] = [];

        if (notification.target_type !== 'all' && notification.target_type !== 'custom') {
            usersSql += ' AND role = ?';
            params.push(notification.target_type);
        }

        const users = await query(usersSql, params) as { id: number; email: string; first_name: string; last_name: string }[];

        // Create user_notifications for each user
        for (const user of users) {
            await query(
                `INSERT IGNORE INTO user_notifications (notification_id, user_id) VALUES (?, ?)`,
                [id, user.id]
            );

            // If email is enabled, send email (placeholder - implement actual email sending)
            if (notification.is_email) {
                // TODO: Implement actual email sending using nodemailer
                // For now, just mark as email_sent
                await query(
                    `UPDATE user_notifications SET email_sent = TRUE, email_sent_at = NOW() 
                     WHERE notification_id = ? AND user_id = ?`,
                    [id, user.id]
                );
            }
        }

        // Update notification as sent
        await query(
            'UPDATE notifications SET status = ?, sent_at = NOW() WHERE id = ?',
            ['sent', id]
        );

        revalidatePath('/admin/notifications');
        return { success: true, recipientsCount: users.length };
    } catch (error) {
        console.error('Send notification error:', error);
        await query('UPDATE notifications SET status = ? WHERE id = ?', ['failed', id]);
        return { error: 'Failed to send notification' };
    }
}

// --- User Notifications (for users to view their notifications) ---

export interface UserNotification {
    id: number;
    notification_id: number;
    user_id: number;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    title: string;
    message: string;
    type: string;
    priority: string;
}

export async function getUnreadNotificationCount(userId: number) {
    const result = await query(
        'SELECT COUNT(*) as count FROM user_notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
    ) as { count: number }[];
    return result[0]?.count || 0;
}

// --- Email Templates ---

export interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    variables: string[] | null;
    category: string;
    is_active: boolean;
}

export async function getEmailTemplates() {
    const templates = await query(
        'SELECT * FROM email_templates ORDER BY category, name'
    ) as EmailTemplate[];

    return templates.map(t => ({
        ...t,
        variables: t.variables ? (typeof t.variables === 'string' ? JSON.parse(t.variables) : t.variables) : []
    }));
}

export async function getEmailTemplate(id: number) {
    const templates = await query(
        'SELECT * FROM email_templates WHERE id = ?',
        [id]
    ) as EmailTemplate[];

    if (templates.length === 0) return null;

    const t = templates[0];
    return {
        ...t,
        variables: t.variables ? (typeof t.variables === 'string' ? JSON.parse(t.variables) : t.variables) : []
    };
}

export async function deleteEmailTemplate(id: number) {
    try {
        await query('DELETE FROM email_templates WHERE id = ?', [id]);
        revalidatePath('/admin/notifications');
        return { success: true };
    } catch (error) {
        console.error('Delete email template error:', error);
        return { error: 'Failed to delete email template' };
    }
}
