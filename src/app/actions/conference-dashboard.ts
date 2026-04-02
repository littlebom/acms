'use server';

import { query } from '@/lib/db';
import { fillMissingDates } from '@/lib/date-utils';
import { getRevenueTotal } from '@/lib/stats-utils';

export async function getConferenceStats() {
    try {
        // 1. KPIs
        const [
            totalRevenue,
            ticketsSoldResult,
            checkedInResult
        ] = await Promise.all([
            getRevenueTotal(),
            query(`SELECT COUNT(*) as count FROM registrations WHERE status = 'paid'`) as unknown as any[],
            query(`SELECT COUNT(*) as count FROM registrations WHERE checked_in_at IS NOT NULL`) as unknown as any[]
        ]);

        const ticketsSold = ticketsSoldResult[0]?.count || 0;
        const checkedInCount = checkedInResult[0]?.count || 0;

        // 2. Sales Trend (Last 30 Days)
        const trendResult = await query(`
            SELECT DATE(registered_at) as date, COUNT(*) as count
            FROM registrations
            WHERE status = 'paid' AND registered_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            GROUP BY DATE(registered_at)
            ORDER BY date ASC
        `) as unknown as any[];

        const salesTrend = fillMissingDates(trendResult, 30);

        // 3. Ticket Type Distribution
        const ticketTypeResult = await query(`
            SELECT t.name as type, COUNT(*) as count
            FROM registrations r
            JOIN tickets t ON r.ticket_id = t.id
            WHERE r.status = 'paid'
            GROUP BY t.name
        `) as unknown as any[];

        // 4. Recent Registrations
        const recentRegistrations = await query(`
            SELECT r.id, u.first_name, u.email, t.name as ticket_type, r.registered_at
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            JOIN tickets t ON r.ticket_id = t.id
            WHERE r.status = 'paid'
            ORDER BY r.registered_at DESC
            LIMIT 5
        `) as unknown as any[];

        return {
            kpi: {
                revenue: totalRevenue,
                sold: ticketsSold,
                checkedIn: checkedInCount,
                checkInRate: ticketsSold > 0 ? Math.round((checkedInCount / ticketsSold) * 100) : 0
            },
            salesTrend,
            ticketTypes: ticketTypeResult,
            recentRegistrations: recentRegistrations.map(r => ({
                id: r.id,
                user: r.first_name || r.email,
                action: 'Registered', // For RecentActivity reuse
                details: { resource: r.ticket_type },
                time: r.registered_at
            }))
        };

    } catch (error) {
        console.error('Error fetching conference stats:', error);
        return null;
    }
}

