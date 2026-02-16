'use server';

import { query } from '@/lib/db';

export interface AuditLog {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    action: string;
    resource: string;
    details: string | null;
    ip_address: string | null;
    created_at: string;
}

interface GetAuditLogsParams {
    page?: number;
    limit?: number;
    search?: string;
    action?: string;
}

export async function getAuditLogs({
    page = 1,
    limit = 20,
    search = '',
    action = ''
}: GetAuditLogsParams) {
    try {
        const offset = (page - 1) * limit;
        const params: any[] = [];

        let whereClause = '1=1';

        if (search) {
            whereClause += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR l.details LIKE ?)`;
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        if (action && action !== 'ALL') {
            whereClause += ` AND l.action = ?`;
            params.push(action);
        }

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) as total 
             FROM audit_logs l 
             LEFT JOIN users u ON l.user_id = u.id 
             WHERE ${whereClause}`,
            params
        ) as any[];

        const total = countResult[0].total;

        // Get logs
        const logs = await query(
            `SELECT l.*, u.full_name as user_name, u.email as user_email 
             FROM audit_logs l 
             LEFT JOIN users u ON l.user_id = u.id 
             WHERE ${whereClause} 
             ORDER BY l.created_at DESC 
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        ) as any[];

        // Serializing dates
        const serializedLogs = logs.map(log => ({
            ...log,
            created_at: log.created_at.toISOString(),
        }));

        return {
            logs: serializedLogs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return { logs: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }
}
