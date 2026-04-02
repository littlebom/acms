'use server';

import { query } from '@/lib/db';
import { fillMissingDates } from '@/lib/date-utils';
import { getRevenueTotal } from '@/lib/stats-utils';

export async function getDashboardStats(eventId?: number) {
    try {
        const eventFilter = eventId ? 'WHERE event_id = ?' : '';
        const paperFilter = eventId ? 'AND p.event_id = ?' : '';
        const ticketFilter = eventId ? 'AND t.event_id = ?' : '';
        const params = eventId ? [eventId] : [];

        // 1. Basic Counts
        const [
            usersCount,
            papersCount,
            registrationsCount
        ] = await Promise.all([
            // Users are global, so we keep global count OR we count users who have interactions with this event?
            // "Users" usually means "Total Accounts". Let's keep it global for now.
            query('SELECT COUNT(*) as count FROM users'),

            // Papers filtered by event
            query(`SELECT COUNT(*) as count FROM papers p WHERE 1=1 ${paperFilter}`, params),

            // Registrations filtered by ticket -> event
            query(`
                SELECT COUNT(*) as count 
                FROM registrations r 
                JOIN tickets t ON r.ticket_id = t.id 
                WHERE r.status = "paid" ${ticketFilter}
            `, params)
        ]);

        // 2. Total Revenue
        const totalRevenue = await getRevenueTotal(ticketFilter, params);

        // 3. Registration Trend (Last 30 Days)
        // We need to filter by event here too
        const trendResult = await query(`
            SELECT DATE(r.registered_at) as date, COUNT(*) as count
            FROM registrations r
            JOIN tickets t ON r.ticket_id = t.id
            WHERE r.registered_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            ${ticketFilter}
            GROUP BY DATE(r.registered_at)
            ORDER BY date ASC
        `, params) as any[];

        // Fill in missing days for a smooth chart
        const trend = fillMissingDates(trendResult, 30);

        // 4. Paper Status Distribution
        const paperStatusResult = await query(`
            SELECT p.status, COUNT(*) as count
            FROM papers p
            WHERE 1=1 ${paperFilter}
            GROUP BY p.status
        `, params) as any[];

        // 5. Recent Activity (Audit Logs)
        // Audit logs might not have event_id easily linked yet. 
        // Keeping them global or limited to top 5 is fine for now until AuditLogs table is upgraded.
        const recentLogsResult = await query(`
            SELECT al.id, al.action, al.resource, al.details, al.created_at, u.first_name, u.email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 5
        `) as any[];

        const recentLogs = recentLogsResult.map(log => ({
            id: log.id,
            user: log.first_name || log.email || 'Unknown',
            action: log.action,
            details: log.details,
            time: log.created_at
        }));

        return {
            counts: {
                users: (usersCount as any[])[0].count,
                papers: (papersCount as any[])[0].count,
                registrations: (registrationsCount as any[])[0].count,
                revenue: totalRevenue
            },
            trend,
            paperStatus: paperStatusResult,
            recentLogs
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
}

