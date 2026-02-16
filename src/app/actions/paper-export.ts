'use server';

import { query } from "@/lib/db";

export interface PaperExportData {
    id: number;
    title: string;
    title_th: string | null;
    abstract: string;
    keywords: string | null;
    track_name: string | null;
    status: string;
    submitter_name: string;
    submitter_email: string;
    submitted_at: Date | null;
    decision_at: Date | null;
    authors: string;
    review_scores: string | null;
    recommendation: string | null;
}

export async function exportPapersData(filters?: {
    status?: string;
    track_id?: number;
    format?: 'json' | 'csv'
}) {
    let sql = `
        SELECT 
            p.id,
            p.title,
            p.title_th,
            p.abstract,
            p.keywords,
            pt.name as track_name,
            p.status,
            CONCAT(u.first_name, ' ', u.last_name) as submitter_name,
            u.email as submitter_email,
            p.submitted_at,
            p.decision_at,
            (SELECT GROUP_CONCAT(CONCAT(pa.first_name, ' ', pa.last_name) ORDER BY pa.author_order SEPARATOR '; ')
             FROM paper_authors pa WHERE pa.paper_id = p.id) as authors,
            (SELECT AVG(pr.score_overall) FROM paper_reviews pr WHERE pr.paper_id = p.id AND pr.score_overall IS NOT NULL) as avg_score,
            (SELECT GROUP_CONCAT(DISTINCT pr.recommendation SEPARATOR ', ') 
             FROM paper_reviews pr WHERE pr.paper_id = p.id AND pr.recommendation IS NOT NULL) as recommendations
        FROM papers p
        LEFT JOIN paper_tracks pt ON p.track_id = pt.id
        LEFT JOIN users u ON p.submitter_id = u.id
        WHERE p.status != 'draft'
    `;
    const params: any[] = [];

    if (filters?.status) {
        sql += ' AND p.status = ?';
        params.push(filters.status);
    }
    if (filters?.track_id) {
        sql += ' AND p.track_id = ?';
        params.push(filters.track_id);
    }

    sql += ' ORDER BY p.id ASC';

    const papers = await query(sql, params) as any[];

    return papers;
}

export async function exportReviewersData() {
    const reviewers = await query(`
        SELECT 
            r.id,
            CONCAT(u.first_name, ' ', u.last_name) as name,
            u.email,
            r.expertise,
            r.affiliation,
            r.total_assignments,
            r.completed_reviews,
            r.is_active,
            (SELECT AVG(pr.score_overall) FROM paper_reviews pr WHERE pr.reviewer_id = r.id) as avg_score_given
        FROM reviewers r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.completed_reviews DESC
    `) as any[];

    return reviewers;
}

export async function exportReviewsData(paperId?: number) {
    let sql = `
        SELECT 
            pr.id,
            pr.paper_id,
            p.title as paper_title,
            CONCAT(u.first_name, ' ', u.last_name) as reviewer_name,
            pr.score_originality,
            pr.score_methodology,
            pr.score_presentation,
            pr.score_relevance,
            pr.score_overall,
            pr.recommendation,
            pr.confidence,
            pr.comments_to_author,
            pr.comments_to_editor,
            pr.submitted_at
        FROM paper_reviews pr
        JOIN papers p ON pr.paper_id = p.id
        JOIN reviewers r ON pr.reviewer_id = r.id
        JOIN users u ON r.user_id = u.id
        WHERE 1=1
    `;
    const params: any[] = [];

    if (paperId) {
        sql += ' AND pr.paper_id = ?';
        params.push(paperId);
    }

    sql += ' ORDER BY pr.paper_id, pr.submitted_at';

    const reviews = await query(sql, params) as any[];

    return reviews;
}

