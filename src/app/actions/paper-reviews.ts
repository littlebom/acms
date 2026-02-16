'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// =====================================================
// Types
// =====================================================

export type ReviewRecommendation = 'strong_accept' | 'accept' | 'minor_revision' | 'major_revision' | 'reject';
export type AssignmentStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'expired';

export interface Reviewer {
    id: number;
    user_id: number;
    expertise?: string;
    affiliation?: string;
    track_id?: number;
    bio?: string;
    total_assignments: number;
    completed_reviews: number;
    is_active: boolean;
    created_at: Date;
    // Joined fields
    first_name?: string;
    last_name?: string;
    email?: string;
    track_name?: string;
}

export interface ReviewerAssignment {
    id: number;
    paper_id: number;
    reviewer_id: number;
    assigned_by?: number;
    status: AssignmentStatus;
    assigned_at: Date;
    responded_at?: Date;
    due_date?: Date;
    completed_at?: Date;
    decline_reason?: string;
    // Joined fields
    paper_title?: string;
    reviewer_name?: string;
}

export interface PaperReview {
    id: number;
    assignment_id: number;
    paper_id: number;
    reviewer_id: number;
    score_originality?: number;
    score_methodology?: number;
    score_presentation?: number;
    score_relevance?: number;
    score_overall?: number;
    comments_to_author?: string;
    comments_to_editor?: string;
    recommendation?: ReviewRecommendation;
    confidence?: 'low' | 'medium' | 'high';
    submitted_at?: Date;
    updated_at: Date;
    // Joined
    reviewer_name?: string;
}

// =====================================================
// Reviewers CRUD
// =====================================================

export async function getReviewers(activeOnly: boolean = true) {
    let sql = `
        SELECT r.*, u.first_name, u.last_name, u.email, pt.name as track_name
        FROM reviewers r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN paper_tracks pt ON r.track_id = pt.id
    `;
    if (activeOnly) {
        sql += ' WHERE r.is_active = TRUE';
    }
    sql += ' ORDER BY u.first_name ASC';

    return await query(sql) as Reviewer[];
}

export async function getReviewer(id: number) {
    const result = await query(`
        SELECT r.*, u.first_name, u.last_name, u.email, pt.name as track_name
        FROM reviewers r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN paper_tracks pt ON r.track_id = pt.id
        WHERE r.id = ?
    `, [id]) as Reviewer[];
    return result.length > 0 ? result[0] : null;
}

export async function getReviewerByUserId(userId: number) {
    const result = await query(`
        SELECT r.*, u.first_name, u.last_name, u.email, pt.name as track_name
        FROM reviewers r
        JOIN users u ON r.user_id = u.id
        LEFT JOIN paper_tracks pt ON r.track_id = pt.id
        WHERE r.user_id = ?
    `, [userId]) as Reviewer[];
    return result.length > 0 ? result[0] : null;
}

export async function createReviewer(formData: FormData) {
    const user_id = parseInt(formData.get('user_id') as string);
    const expertise = formData.get('expertise') as string;
    const affiliation = formData.get('affiliation') as string;
    const track_id = formData.get('track_id') ? parseInt(formData.get('track_id') as string) : null;
    const bio = formData.get('bio') as string;

    try {
        await query(
            'INSERT INTO reviewers (user_id, expertise, affiliation, track_id, bio) VALUES (?, ?, ?, ?, ?)',
            [user_id, expertise || null, affiliation || null, track_id, bio || null]
        );

        // Sync User Role: Promote to 'reviewer' if not admin/chair
        const user = await query('SELECT role FROM users WHERE id = ?', [user_id]) as { role: string }[];
        if (user.length > 0) {
            const currentRole = user[0].role;
            if (currentRole !== 'admin' && currentRole !== 'chair') {
                await query("UPDATE users SET role = 'reviewer' WHERE id = ?", [user_id]);
            }
        }

        revalidatePath('/admin/papers/reviewers');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return { error: 'This user is already a reviewer' };
        }
        console.error('Create reviewer error:', error);
        return { error: 'Failed to create reviewer' };
    }
}

export async function updateReviewer(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const expertise = formData.get('expertise') as string;
    const affiliation = formData.get('affiliation') as string;
    const track_id = formData.get('track_id') ? parseInt(formData.get('track_id') as string) : null;
    const bio = formData.get('bio') as string;
    const is_active = formData.get('is_active') === 'true';

    try {
        await query(
            'UPDATE reviewers SET expertise = ?, affiliation = ?, track_id = ?, bio = ?, is_active = ? WHERE id = ?',
            [expertise || null, affiliation || null, track_id, bio || null, is_active, id]
        );
        revalidatePath('/admin/papers/reviewers');
        return { success: true };
    } catch (error) {
        console.error('Update reviewer error:', error);
        return { error: 'Failed to update reviewer' };
    }
}

export async function deleteReviewer(id: number) {
    // 1. Check for assignments
    const assignments = await query(
        'SELECT id FROM reviewer_assignments WHERE reviewer_id = ?',
        [id]
    ) as any[];

    if (assignments.length > 0) {
        return { error: 'Cannot delete reviewer with active or past assignments. Please reassign or mark as inactive instead.' };
    }

    // 2. Delete
    try {
        // Get user_id to sync role
        const reviewer = await query('SELECT user_id FROM reviewers WHERE id = ?', [id]) as { user_id: number }[];

        if (reviewer.length > 0) {
            const userId = reviewer[0].user_id;
            // Check if user is currently 'reviewer', if so downgrade to 'attendee'
            // We do NOT downgrade if they are admin or chair (though they shouldn't be 'reviewer' role in users table if so, but safety first)
            const user = await query('SELECT role FROM users WHERE id = ?', [userId]) as { role: string }[];
            if (user.length > 0 && user[0].role === 'reviewer') {
                await query("UPDATE users SET role = 'attendee' WHERE id = ?", [userId]);
            }
        }

        await query('DELETE FROM reviewers WHERE id = ?', [id]);
        revalidatePath('/admin/papers/reviewers');
        return { success: true };
    } catch (error) {
        console.error('Delete reviewer error:', error);
        return { error: 'Failed to delete reviewer' };
    }
}

// =====================================================
// Reviewer Assignments
// =====================================================

export async function assignReviewer(paperId: number, reviewerId: number, dueDate?: Date) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check if already assigned
        const existing = await query(
            'SELECT id FROM reviewer_assignments WHERE paper_id = ? AND reviewer_id = ?',
            [paperId, reviewerId]
        ) as any[];

        if (existing.length > 0) {
            return { error: 'Reviewer already assigned to this paper' };
        }

        await query(
            `INSERT INTO reviewer_assignments (paper_id, reviewer_id, assigned_by, due_date)
             VALUES (?, ?, ?, ?)`,
            [paperId, reviewerId, session.userId, dueDate || null]
        );

        // Update paper status to under_review if it was submitted
        await query(
            "UPDATE papers SET status = 'under_review' WHERE id = ? AND status = 'submitted'",
            [paperId]
        );

        // Update reviewer's assignment count
        await query(
            'UPDATE reviewers SET total_assignments = total_assignments + 1 WHERE id = ?',
            [reviewerId]
        );

        revalidatePath('/admin/papers');
        revalidatePath(`/admin/papers/${paperId}`);
        return { success: true };
    } catch (error) {
        console.error('Assign reviewer error:', error);
        return { error: 'Failed to assign reviewer' };
    }
}

export async function getAssignmentsForPaper(paperId: number) {
    return await query(`
        SELECT ra.*, 
               CONCAT(u.first_name, ' ', u.last_name) as reviewer_name,
               u.email as reviewer_email
        FROM reviewer_assignments ra
        JOIN reviewers r ON ra.reviewer_id = r.id
        JOIN users u ON r.user_id = u.id
        WHERE ra.paper_id = ?
        ORDER BY ra.assigned_at DESC
    `, [paperId]) as ReviewerAssignment[];
}

export async function getMyAssignments() {
    const session = await getSession();
    if (!session) return [];

    const reviewer = await getReviewerByUserId(session.userId);
    if (!reviewer) return [];

    return await query(`
        SELECT ra.*, p.title as paper_title, p.status as paper_status
        FROM reviewer_assignments ra
        JOIN papers p ON ra.paper_id = p.id
        WHERE ra.reviewer_id = ?
        ORDER BY ra.assigned_at DESC
    `, [reviewer.id]) as (ReviewerAssignment & { paper_status: string })[];
}

export async function respondToAssignment(assignmentId: number, accept: boolean, declineReason?: string) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        const status = accept ? 'accepted' : 'declined';
        await query(
            `UPDATE reviewer_assignments 
             SET status = ?, responded_at = NOW(), decline_reason = ?
             WHERE id = ?`,
            [status, accept ? null : declineReason, assignmentId]
        );

        revalidatePath('/reviewer/assignments');
        return { success: true };
    } catch (error) {
        console.error('Respond to assignment error:', error);
        return { error: 'Failed to respond' };
    }
}


export async function assignSelfAsReviewer(paperId: number) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    try {
        // 1. Check if user is already a reviewer
        let reviewer = await getReviewerByUserId(session.userId);

        // 2. If not, create a reviewer profile for them automatically
        if (!reviewer) {
            await query(
                'INSERT INTO reviewers (user_id, expertise, affiliation, bio, is_active) VALUES (?, ?, ?, ?, ?)',
                [session.userId, 'Admin Reviewer', 'System Admin', 'Auto-generated for admin review', true]
            );
            reviewer = await getReviewerByUserId(session.userId);
        }

        if (!reviewer) {
            throw new Error('Failed to retrieve reviewer profile after creation');
        }

        // 3. Check if already assigned
        const existingAssignment = await query(
            'SELECT id FROM reviewer_assignments WHERE paper_id = ? AND reviewer_id = ?',
            [paperId, reviewer.id]
        ) as { id: number }[];

        let assignmentId: number;

        if (existingAssignment.length > 0) {
            assignmentId = existingAssignment[0].id;
        } else {
            // 4. Assign the paper
            const result = await query(
                `INSERT INTO reviewer_assignments (paper_id, reviewer_id, assigned_by, status, assigned_at, responded_at)
                 VALUES (?, ?, ?, 'accepted', NOW(), NOW())`,
                [paperId, reviewer.id, session.userId]
            ) as any;
            assignmentId = result.insertId;

            // Update paper status if needed
            await query(
                "UPDATE papers SET status = 'under_review' WHERE id = ? AND status = 'submitted'",
                [paperId]
            );

            // Update reviewer stats
            await query(
                'UPDATE reviewers SET total_assignments = total_assignments + 1 WHERE id = ?',
                [reviewer.id]
            );
        }

        revalidatePath(`/admin/papers/${paperId}`);
        return { success: true, assignmentId };
    } catch (error) {
        console.error('Assign self error:', error);
        return { error: 'Failed to assign self as reviewer' };
    }
}

// =====================================================
// Paper Reviews
// =====================================================

export async function submitReview(formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const assignment_id = parseInt(formData.get('assignment_id') as string);
    const paper_id = parseInt(formData.get('paper_id') as string);

    // Get reviewer
    const reviewer = await getReviewerByUserId(session.userId);
    if (!reviewer) {
        return { error: 'You are not a registered reviewer' };
    }

    // Validate assignment
    const assignments = await query(
        'SELECT id FROM reviewer_assignments WHERE id = ? AND reviewer_id = ?',
        [assignment_id, reviewer.id]
    ) as any[];

    if (assignments.length === 0) {
        return { error: 'Invalid assignment' };
    }

    const scores = {
        originality: parseInt(formData.get('score_originality') as string) || null,
        methodology: parseInt(formData.get('score_methodology') as string) || null,
        presentation: parseInt(formData.get('score_presentation') as string) || null,
        relevance: parseInt(formData.get('score_relevance') as string) || null,
        overall: parseInt(formData.get('score_overall') as string) || null,
    };

    const comments_to_author = formData.get('comments_to_author') as string;
    const comments_to_editor = formData.get('comments_to_editor') as string;
    const recommendation = formData.get('recommendation') as ReviewRecommendation;
    const confidence = formData.get('confidence') as 'low' | 'medium' | 'high' || 'medium';

    try {
        // Check if review exists
        const existing = await query(
            'SELECT id FROM paper_reviews WHERE assignment_id = ?',
            [assignment_id]
        ) as any[];

        if (existing.length > 0) {
            // Update
            await query(
                `UPDATE paper_reviews SET
                    score_originality = ?, score_methodology = ?, score_presentation = ?,
                    score_relevance = ?, score_overall = ?,
                    comments_to_author = ?, comments_to_editor = ?,
                    recommendation = ?, confidence = ?, submitted_at = NOW()
                 WHERE assignment_id = ?`,
                [
                    scores.originality, scores.methodology, scores.presentation,
                    scores.relevance, scores.overall,
                    comments_to_author, comments_to_editor,
                    recommendation, confidence, assignment_id
                ]
            );
        } else {
            // Insert
            await query(
                `INSERT INTO paper_reviews (
                    assignment_id, paper_id, reviewer_id,
                    score_originality, score_methodology, score_presentation,
                    score_relevance, score_overall,
                    comments_to_author, comments_to_editor,
                    recommendation, confidence, submitted_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    assignment_id, paper_id, reviewer.id,
                    scores.originality, scores.methodology, scores.presentation,
                    scores.relevance, scores.overall,
                    comments_to_author, comments_to_editor,
                    recommendation, confidence
                ]
            );
        }

        // Update assignment status
        await query(
            "UPDATE reviewer_assignments SET status = 'completed', completed_at = NOW() WHERE id = ?",
            [assignment_id]
        );

        // Update reviewer's completed count
        await query(
            'UPDATE reviewers SET completed_reviews = completed_reviews + 1 WHERE id = ?',
            [reviewer.id]
        );

        revalidatePath('/reviewer/assignments');
        revalidatePath(`/admin/papers/${paper_id}`);
        return { success: true };
    } catch (error) {
        console.error('Submit review error:', error);
        return { error: 'Failed to submit review' };
    }
}

export async function getReviewsForPaper(paperId: number) {
    return await query(`
        SELECT pr.*, CONCAT(u.first_name, ' ', u.last_name) as reviewer_name
        FROM paper_reviews pr
        JOIN reviewers r ON pr.reviewer_id = r.id
        JOIN users u ON r.user_id = u.id
        WHERE pr.paper_id = ?
        ORDER BY pr.submitted_at DESC
    `, [paperId]) as PaperReview[];
}

export async function getReviewSummary(paperId: number) {
    const reviews = await getReviewsForPaper(paperId);

    if (reviews.length === 0) {
        return null;
    }

    const scores = reviews.filter(r => r.score_overall);
    const avgScore = scores.length > 0
        ? scores.reduce((sum, r) => sum + (r.score_overall || 0), 0) / scores.length
        : null;

    const recommendations = reviews.filter(r => r.recommendation);
    const recommendationCounts = recommendations.reduce((acc, r) => {
        if (r.recommendation) {
            acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return {
        totalReviews: reviews.length,
        completedReviews: reviews.filter(r => r.submitted_at).length,
        averageScore: avgScore ? avgScore.toFixed(1) : null,
        recommendationCounts,
        reviews
    };
}
