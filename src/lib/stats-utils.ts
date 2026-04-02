import { query } from '@/lib/db';

export async function getRevenueTotal(ticketFilter = '', params: any[] = []): Promise<number> {
    const result = await query(`
        SELECT SUM(t.price) as total
        FROM registrations r
        JOIN tickets t ON r.ticket_id = t.id
        WHERE r.status = 'paid' ${ticketFilter}
    `, params) as any[];
    return result[0]?.total || 0;
}
