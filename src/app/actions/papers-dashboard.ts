'use server';

import { query } from '@/lib/db';

export async function getPaperDashboardStats() {
    try {
        // 1. KPIs — single aggregated query instead of 4 separate COUNTs
        const [paperCountsResult, reviewersResult] = await Promise.all([
            query(`
                SELECT
                    COUNT(CASE WHEN status != 'draft' THEN 1 END) as total,
                    COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
                    COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
                FROM papers
            `) as unknown as any[],
            query(`SELECT COUNT(*) as count FROM reviewers WHERE is_active = TRUE`) as unknown as any[]
        ]);

        const totalPapers = paperCountsResult[0]?.total || 0;
        const underReview = paperCountsResult[0]?.under_review || 0;
        const accepted = paperCountsResult[0]?.accepted || 0;
        const rejected = paperCountsResult[0]?.rejected || 0;
        const activeReviewers = reviewersResult[0]?.count || 0;

        const totalDecided = accepted + rejected;
        const acceptanceRate = totalDecided > 0
            ? ((accepted / totalDecided) * 100).toFixed(1)
            : '0';

        // 2. Paper Status Distribution
        const paperStatusResult = await query(`
            SELECT status, COUNT(*) as count
            FROM papers
            WHERE status != 'draft'
            GROUP BY status
        `) as unknown as any[];

        // 3. Tracks Distribution
        const tracksResult = await query(`
            SELECT pt.name as track, COUNT(p.id) as count
            FROM paper_tracks pt
            LEFT JOIN papers p ON pt.id = p.track_id AND p.status != 'draft'
            WHERE pt.is_active = TRUE
            GROUP BY pt.id, pt.name
            ORDER BY count DESC
            LIMIT 10
        `) as unknown as any[];

        // 4. Recent Submissions
        const recentSubmissions = await query(`
            SELECT p.id, p.title, p.status, p.created_at, u.first_name, u.email
            FROM papers p
            JOIN users u ON p.submitter_id = u.id
            WHERE p.status != 'draft'
            ORDER BY p.created_at DESC
            LIMIT 5
        `) as unknown as any[];

        return {
            kpi: {
                totalPapers,
                underReview,
                accepted,
                acceptanceRate,
                activeReviewers
            },
            paperStatus: paperStatusResult,
            tracksDistribution: tracksResult,
            recentSubmissions: recentSubmissions.map(p => ({
                id: p.id,
                user: p.first_name || p.email,
                action: 'Submitted', // For RecentActivity reuse
                details: { resource: 'Paper', details: p.title },
                time: p.created_at
            }))
        };

    } catch (error) {
        console.error('Error fetching paper dashboard stats:', error);
        return null;
    }
}
