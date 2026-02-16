import { query } from '@/lib/db';

export async function logActivity(
    userId: number,
    action: string,
    resource: string,
    details?: any,
    ipAddress?: string
) {
    try {
        const detailsString = details ? JSON.stringify(details) : null;
        await query(
            `INSERT INTO audit_logs (user_id, action, resource, details, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
            [userId, action, resource, detailsString, ipAddress]
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Silent fail to not disrupt main flow
    }
}
