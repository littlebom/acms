'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// =====================================================
// Types
// =====================================================

export type PaperStatus =
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'revision_required'
    | 'revision_submitted'
    | 'accepted'
    | 'rejected'
    | 'camera_ready'
    | 'published';

export interface Paper {
    id: number;
    title: string;
    title_th?: string;
    abstract: string;
    abstract_th?: string;
    keywords?: string;
    keywords_th?: string;
    track_id?: number;
    event_id?: number;
    submitter_id: number;
    status: PaperStatus;
    submitted_at?: Date;
    decision_at?: Date;
    published_at?: Date;
    created_at: Date;
    updated_at: Date;
    // Joined fields
    track_name?: string;
    submitter_name?: string;
    submitter_email?: string;
}

export interface PaperAuthor {
    id: number;
    paper_id: number;
    user_id?: number;
    first_name: string;
    last_name: string;
    email: string;
    institution?: string;
    country?: string;
    author_order: number;
    is_corresponding: boolean;
}

export interface PaperFile {
    id: number;
    paper_id: number;
    file_name: string;
    file_path: string;
    file_size?: number;
    file_type?: string;
    version_type: 'original' | 'blind' | 'revision' | 'camera_ready' | 'supplementary';
    version_number: number;
    uploaded_by?: number;
    uploaded_at: Date;
}

// =====================================================
// Papers CRUD
// =====================================================

export async function getPapers(filters?: { status?: PaperStatus; track_id?: number; submitter_id?: number; event_id?: number }) {
    let sql = `
        SELECT p.*, 
               t.name as track_name,
               CONCAT(u.first_name, ' ', u.last_name) as submitter_name,
               u.email as submitter_email
        FROM papers p
        LEFT JOIN paper_tracks t ON p.track_id = t.id
        LEFT JOIN users u ON p.submitter_id = u.id
        WHERE 1=1
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
    if (filters?.submitter_id) {
        sql += ' AND p.submitter_id = ?';
        params.push(filters.submitter_id);
    }
    if (filters?.event_id) {
        sql += ' AND p.event_id = ?';
        params.push(filters.event_id);
    }

    sql += ' ORDER BY p.created_at DESC';

    return await query(sql, params) as Paper[];
}

export async function getPaper(id: number) {
    const papers = await query(`
        SELECT p.*, 
               t.name as track_name,
               CONCAT(u.first_name, ' ', u.last_name) as submitter_name,
               u.email as submitter_email
        FROM papers p
        LEFT JOIN paper_tracks t ON p.track_id = t.id
        LEFT JOIN users u ON p.submitter_id = u.id
        WHERE p.id = ?
    `, [id]) as Paper[];

    return papers.length > 0 ? papers[0] : null;
}

export async function getPaperAuthors(paperId: number) {
    return await query(
        'SELECT * FROM paper_authors WHERE paper_id = ? ORDER BY author_order ASC',
        [paperId]
    ) as PaperAuthor[];
}

export async function getPaperFiles(paperId: number) {
    return await query(
        'SELECT * FROM paper_files WHERE paper_id = ? ORDER BY uploaded_at DESC',
        [paperId]
    ) as PaperFile[];
}

// =====================================================
// Create Paper (Submit)
// =====================================================

export async function createPaper(formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const title = formData.get('title') as string;
    const title_th = formData.get('title_th') as string;
    const abstract = formData.get('abstract') as string;
    const abstract_th = formData.get('abstract_th') as string;
    const keywords = formData.get('keywords') as string;
    const keywords_th = formData.get('keywords_th') as string;
    const track_id = formData.get('track_id') ? parseInt(formData.get('track_id') as string) : null;
    const event_id = formData.get('event_id') ? parseInt(formData.get('event_id') as string) : null;
    const isDraft = formData.get('save_draft') === 'true';

    try {
        // Insert paper
        const result = await query(
            `INSERT INTO papers (
                title, title_th, abstract, abstract_th, 
                keywords, keywords_th, track_id, event_id, 
                submitter_id, status, submitted_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, title_th || null, abstract, abstract_th || null,
                keywords || null, keywords_th || null, track_id, event_id,
                session.userId,
                isDraft ? 'draft' : 'submitted',
                isDraft ? null : new Date()
            ]
        ) as any;

        const paperId = result.insertId;

        // Add submitter as first author
        const user = await query('SELECT first_name, last_name, email FROM users WHERE id = ?', [session.userId]) as any[];
        if (user.length > 0) {
            await query(
                `INSERT INTO paper_authors (paper_id, user_id, first_name, last_name, email, author_order, is_corresponding)
                 VALUES (?, ?, ?, ?, ?, 1, TRUE)`,
                [paperId, session.userId, user[0].first_name, user[0].last_name, user[0].email]
            );
        }

        // Handle co-authors (if any)
        const coAuthorsJson = formData.get('co_authors') as string;
        if (coAuthorsJson) {
            try {
                const coAuthors = JSON.parse(coAuthorsJson);
                for (let i = 0; i < coAuthors.length; i++) {
                    const author = coAuthors[i];
                    await query(
                        `INSERT INTO paper_authors (paper_id, first_name, last_name, email, institution, author_order, is_corresponding)
                         VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
                        [paperId, author.first_name, author.last_name, author.email, author.institution || null, i + 2]
                    );
                }
            } catch (e) {
                console.error('Error parsing co-authors:', e);
            }
        }

        // Handle file upload
        const file = formData.get('file') as File;
        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const timestamp = Date.now();
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `paper_${paperId}_${timestamp}_${safeName}`;
            const filePath = `/uploads/papers/${fileName}`;

            await writeFile(join(process.cwd(), 'public', filePath), buffer);

            await query(
                `INSERT INTO paper_files (paper_id, file_name, file_path, file_size, file_type, version_type, uploaded_by)
                 VALUES (?, ?, ?, ?, ?, 'original', ?)`,
                [paperId, file.name, filePath, file.size, file.type, session.userId]
            );
        }

        revalidatePath('/my-submissions');
        revalidatePath('/admin/papers');

        return { success: true, paperId };
    } catch (error) {
        console.error('Create paper error:', error);
        return { error: 'Failed to submit paper' };
    }
}

// =====================================================
// Update Paper
// =====================================================

export async function updatePaper(formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const id = parseInt(formData.get('id') as string);
    const title = formData.get('title') as string;
    const title_th = formData.get('title_th') as string;
    const abstract = formData.get('abstract') as string;
    const abstract_th = formData.get('abstract_th') as string;
    const keywords = formData.get('keywords') as string;
    const keywords_th = formData.get('keywords_th') as string;
    const track_id = formData.get('track_id') ? parseInt(formData.get('track_id') as string) : null;

    try {
        // Check ownership
        const paper = await getPaper(id);
        if (!paper || paper.submitter_id !== session.userId) {
            return { error: 'Unauthorized' };
        }

        await query(
            `UPDATE papers SET 
                title = ?, title_th = ?, abstract = ?, abstract_th = ?,
                keywords = ?, keywords_th = ?, track_id = ?, updated_at = NOW()
             WHERE id = ?`,
            [title, title_th || null, abstract, abstract_th || null, keywords || null, keywords_th || null, track_id, id]
        );

        revalidatePath('/my-submissions');
        revalidatePath(`/my-submissions/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Update paper error:', error);
        return { error: 'Failed to update paper' };
    }
}

// =====================================================
// Update Paper Status (Admin/Editor)
// =====================================================

export async function updatePaperStatus(paperId: number, status: PaperStatus, comments?: string) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        // Update status
        let updateSql = 'UPDATE papers SET status = ?';
        const params: any[] = [status];

        if (status === 'accepted' || status === 'rejected') {
            updateSql += ', decision_at = NOW()';
        }
        if (status === 'published') {
            updateSql += ', published_at = NOW()';
        }

        updateSql += ' WHERE id = ?';
        params.push(paperId);

        await query(updateSql, params);

        // Record decision
        if (['accepted', 'rejected', 'revision_required'].includes(status)) {
            let decision = status as string;
            if (status === 'accepted') decision = 'accept';
            else if (status === 'rejected') decision = 'reject';
            else if (status === 'revision_required') decision = 'major_revision';

            await query(
                `INSERT INTO paper_decisions (paper_id, decided_by, decision, comments)
                 VALUES (?, ?, ?, ?)`,
                [paperId, session.userId, decision, comments || null]
            );
        }

        revalidatePath('/admin/papers');
        revalidatePath(`/admin/papers/${paperId}`);
        return { success: true };
    } catch (error) {
        console.error('Update paper status error:', error);
        return { error: 'Failed to update status' };
    }
}

// =====================================================
// Upload Revision
// =====================================================

export async function uploadRevision(formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const paperId = parseInt(formData.get('paper_id') as string);
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
        return { error: 'No file provided' };
    }

    try {
        const paper = await getPaper(paperId);
        if (!paper || paper.submitter_id !== session.userId) {
            return { error: 'Unauthorized' };
        }

        // Get current version number
        const files = await query(
            "SELECT MAX(version_number) as max_version FROM paper_files WHERE paper_id = ? AND version_type = 'revision'",
            [paperId]
        ) as any[];
        const nextVersion = (files[0]?.max_version || 0) + 1;

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `paper_${paperId}_rev${nextVersion}_${timestamp}_${safeName}`;
        const filePath = `/uploads/papers/${fileName}`;

        await writeFile(join(process.cwd(), 'public', filePath), buffer);

        await query(
            `INSERT INTO paper_files (paper_id, file_name, file_path, file_size, file_type, version_type, version_number, uploaded_by)
             VALUES (?, ?, ?, ?, ?, 'revision', ?, ?)`,
            [paperId, file.name, filePath, file.size, file.type, nextVersion, session.userId]
        );

        // Update paper status
        await query(
            "UPDATE papers SET status = 'revision_submitted', updated_at = NOW() WHERE id = ?",
            [paperId]
        );

        revalidatePath('/my-submissions');
        revalidatePath(`/my-submissions/${paperId}`);
        return { success: true };
    } catch (error) {
        console.error('Upload revision error:', error);
        return { error: 'Failed to upload revision' };
    }
}

// =====================================================
// Delete Paper (Draft only)
// =====================================================

export async function deletePaper(paperId: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const paper = await getPaper(paperId);
        if (!paper || paper.submitter_id !== session.userId) {
            return { error: 'Unauthorized' };
        }
        if (paper.status !== 'draft') {
            return { error: 'Can only delete draft papers' };
        }

        // Delete related data
        await query('DELETE FROM paper_files WHERE paper_id = ?', [paperId]);
        await query('DELETE FROM paper_authors WHERE paper_id = ?', [paperId]);
        await query('DELETE FROM papers WHERE id = ?', [paperId]);

        revalidatePath('/my-submissions');
        return { success: true };
    } catch (error) {
        console.error('Delete paper error:', error);
        return { error: 'Failed to delete paper' };
    }
}

// =====================================================
// Statistics
// =====================================================

export async function getPaperStats() {
    const stats = await query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
            SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
            SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
            SUM(CASE WHEN status = 'revision_required' OR status = 'revision_submitted' THEN 1 ELSE 0 END) as revision,
            SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published
        FROM papers
        WHERE status != 'draft'
    `) as any[];

    return stats[0] || { total: 0, submitted: 0, under_review: 0, accepted: 0, rejected: 0, revision: 0, published: 0 };
}
// =====================================================
// Abstract Book Data
// =====================================================

export async function getAbstractBookData(filters?: { track_id?: number }) {
    try {
        let sql = `
            SELECT p.id, p.title, p.abstract, p.keywords, pt.name as track_name
            FROM papers p
            LEFT JOIN paper_tracks pt ON p.track_id = pt.id
            WHERE p.status IN ('accepted', 'camera_ready', 'published')
        `;
        const params: any[] = [];

        if (filters?.track_id) {
            sql += ' AND p.track_id = ?';
            params.push(filters.track_id);
        }

        sql += ' ORDER BY pt.name, p.id';

        const papers = await query(sql, params) as any[];

        // Fetch authors for each paper
        const papersWithAuthors = await Promise.all(papers.map(async (paper) => {
            const authors = await query(
                'SELECT first_name, last_name, email, institution, country, author_order, is_corresponding FROM paper_authors WHERE paper_id = ? ORDER BY author_order ASC',
                [paper.id]
            ) as PaperAuthor[];
            return { ...paper, authors };
        }));

        return papersWithAuthors;
    } catch (error) {
        console.error('Error fetching abstract book data:', error);
        return [];
    }
}
