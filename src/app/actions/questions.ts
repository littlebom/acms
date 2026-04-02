'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// --- Questionnaires ---

export interface Questionnaire {
    id: number;
    title: string;
    description: string | null;
    category: 'pre-event' | 'post-event' | 'research' | 'custom';
    target_type: 'all' | 'attendee' | 'speaker' | 'reviewer' | 'author';
    event_id: number | null;
    is_active: boolean;
    is_anonymous: boolean;
    start_date: string | null;
    end_date: string | null;
    questions_count?: number;
    responses_count?: number;
    created_at?: string;
}

export async function getQuestionnaires(category?: string) {
    let sql = `
        SELECT q.*, 
            COUNT(DISTINCT qu.id) as questions_count,
            COUNT(DISTINCT r.id) as responses_count
        FROM questionnaires q
        LEFT JOIN questions qu ON q.id = qu.questionnaire_id
        LEFT JOIN questionnaire_responses r ON q.id = r.questionnaire_id AND r.status = 'completed'
    `;
    const params: any[] = [];

    if (category) {
        sql += ' WHERE q.category = ?';
        params.push(category);
    }

    sql += ' GROUP BY q.id ORDER BY q.id DESC';

    const questionnaires = await query(sql, params) as Questionnaire[];
    return questionnaires;
}

export async function getQuestionnaire(id: number) {
    const questionnaires = await query(
        'SELECT * FROM questionnaires WHERE id = ?',
        [id]
    ) as Questionnaire[];
    return questionnaires.length > 0 ? questionnaires[0] : null;
}

export async function createQuestionnaire(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string || 'pre-event';
    const target_type = formData.get('target_type') as string || 'all';
    const is_anonymous = formData.get('is_anonymous') === 'on';

    try {
        await query(
            `INSERT INTO questionnaires (title, description, category, target_type, is_anonymous) 
             VALUES (?, ?, ?, ?, ?)`,
            [title, description, category, target_type, is_anonymous]
        );
        revalidatePath('/admin/questions');
        return { success: true };
    } catch (error) {
        console.error('Create questionnaire error:', error);
        return { error: 'Failed to create questionnaire' };
    }
}

export async function updateQuestionnaire(id: number, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const target_type = formData.get('target_type') as string;
    const is_active = formData.get('is_active') === 'on';
    const is_anonymous = formData.get('is_anonymous') === 'on';

    try {
        await query(
            `UPDATE questionnaires SET 
                title = ?, description = ?, category = ?, target_type = ?,
                is_active = ?, is_anonymous = ?
             WHERE id = ?`,
            [title, description, category, target_type, is_active, is_anonymous, id]
        );
        revalidatePath('/admin/questions');
        revalidatePath(`/admin/questions/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Update questionnaire error:', error);
        return { error: 'Failed to update questionnaire' };
    }
}

export async function deleteQuestionnaire(id: number) {
    try {
        await query('DELETE FROM questionnaires WHERE id = ?', [id]);
        revalidatePath('/admin/questions');
        return { success: true };
    } catch (error) {
        console.error('Delete questionnaire error:', error);
        return { error: 'Failed to delete questionnaire' };
    }
}

// --- Questions ---

export interface Question {
    id: number;
    questionnaire_id: number;
    question_text: string;
    type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating' | 'date' | 'number';
    options: string | null;
    is_required: boolean;
    display_order: number;
    placeholder: string | null;
    min_value: number | null;
    max_value: number | null;
}

export async function getQuestions(questionnaireId: number) {
    const questions = await query(
        'SELECT * FROM questions WHERE questionnaire_id = ? ORDER BY display_order ASC, id ASC',
        [questionnaireId]
    ) as Question[];
    return questions;
}

export async function createQuestion(formData: FormData) {
    const questionnaire_id = formData.get('questionnaire_id');
    const question_text = formData.get('question_text') as string;
    const type = formData.get('type') as string;
    const is_required = formData.get('is_required') === 'on';
    const options = formData.get('options') as string;
    const placeholder = formData.get('placeholder') as string;
    const display_order = parseInt(formData.get('display_order') as string) || 0;

    try {
        await query(
            `INSERT INTO questions (questionnaire_id, question_text, type, options, is_required, placeholder, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [questionnaire_id, question_text, type, options || null, is_required, placeholder || null, display_order]
        );
        revalidatePath(`/admin/questions/${questionnaire_id}`);
        return { success: true };
    } catch (error) {
        console.error('Create question error:', error);
        return { error: 'Failed to create question' };
    }
}

export async function updateQuestion(formData: FormData) {
    const id = formData.get('id');
    const questionnaire_id = formData.get('questionnaire_id');
    const question_text = formData.get('question_text') as string;
    const type = formData.get('type') as string;
    const is_required = formData.get('is_required') === 'on';
    const options = formData.get('options') as string;
    const placeholder = formData.get('placeholder') as string;
    const display_order = parseInt(formData.get('display_order') as string) || 0;

    try {
        await query(
            `UPDATE questions SET 
                question_text = ?, type = ?, options = ?, is_required = ?,
                placeholder = ?, display_order = ?
             WHERE id = ?`,
            [question_text, type, options || null, is_required, placeholder || null, display_order, id]
        );
        revalidatePath(`/admin/questions/${questionnaire_id}`);
        return { success: true };
    } catch (error) {
        console.error('Update question error:', error);
        return { error: 'Failed to update question' };
    }
}

export async function deleteQuestion(id: number, questionnaireId?: number) {
    try {
        await query('DELETE FROM questions WHERE id = ?', [id]);
        if (questionnaireId) {
            revalidatePath(`/admin/questions/${questionnaireId}`);
        }
        return { success: true };
    } catch (error) {
        console.error('Delete question error:', error);
        return { error: 'Failed to delete question' };
    }
}

// --- Responses & Answers ---

export interface QuestionnaireResponse {
    id: number;
    questionnaire_id: number;
    user_id: number | null;
    event_id: number | null;
    session_token: string;
    status: 'started' | 'completed' | 'abandoned';
    started_at: string;
    completed_at: string | null;
    user_name?: string;
    user_email?: string;
}

export interface Answer {
    id: number;
    user_id: number | null;
    questionnaire_id: number;
    question_id: number;
    answer_text: string | null;
    answer_value: number | null;
    session_id: string | null;
    submitted_at: string;
}

export async function getQuestionnaireResponses(questionnaireId: number) {
    const responses = await query(
        `SELECT r.*, u.first_name, u.last_name, u.email,
                CONCAT(u.first_name, ' ', u.last_name) as user_name
         FROM questionnaire_responses r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.questionnaire_id = ?
         ORDER BY r.started_at DESC`,
        [questionnaireId]
    ) as (QuestionnaireResponse & { first_name?: string; last_name?: string; email?: string })[];

    return responses.map(r => ({
        ...r,
        user_name: r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : 'Anonymous',
        user_email: r.email || null
    }));
}

export async function submitSurveyResponse(
    questionnaireId: number,
    answers: { questionId: number; answer: string | number }[],
    eventId?: number
) {
    const session = await getSession();
    const userId = session?.userId || null;
    const sessionToken = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        // Create response record
        await query(
            `INSERT INTO questionnaire_responses (questionnaire_id, user_id, event_id, session_token, status, completed_at) 
             VALUES (?, ?, ?, ?, 'completed', NOW())`,
            [questionnaireId, userId, eventId || null, sessionToken]
        );

        // Insert all answers
        if (answers.length > 0) {
            for (const a of answers) {
                const isNumeric = typeof a.answer === 'number';
                await query(
                    `INSERT INTO answers (user_id, questionnaire_id, question_id, answer_text, answer_value, session_id)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        userId,
                        questionnaireId,
                        a.questionId,
                        isNumeric ? null : String(a.answer),
                        isNumeric ? a.answer : null,
                        sessionToken
                    ]
                );
            }
        }

        revalidatePath(`/admin/questions/${questionnaireId}/results`);
        return { success: true, sessionToken };
    } catch (error) {
        console.error('Submit survey response error:', error);
        return { error: 'Failed to submit survey response' };
    }
}

// --- Analytics ---

export interface QuestionStats {
    question_id: number;
    question_text: string;
    type: string;
    total_responses: number;
    options_breakdown?: { option: string; count: number; percentage: number }[];
    average_value?: number;
    text_responses?: string[];
}

export async function getQuestionnaireAnalytics(questionnaireId: number) {
    // Get questionnaire info
    const questionnaire = await getQuestionnaire(questionnaireId);
    if (!questionnaire) return null;

    // Get all questions
    const questions = await getQuestions(questionnaireId);

    // Get response count
    const responseCountResult = await query(
        `SELECT COUNT(*) as total FROM questionnaire_responses 
         WHERE questionnaire_id = ? AND status = 'completed'`,
        [questionnaireId]
    ) as { total: number }[];
    const totalResponses = responseCountResult[0]?.total || 0;

    // Get stats for each question
    const questionStats: QuestionStats[] = [];

    for (const q of questions) {
        const stat: QuestionStats = {
            question_id: q.id,
            question_text: q.question_text,
            type: q.type,
            total_responses: 0
        };

        // Get answer count for this question
        const answerCountResult = await query(
            `SELECT COUNT(*) as total FROM answers WHERE question_id = ?`,
            [q.id]
        ) as { total: number }[];
        stat.total_responses = answerCountResult[0]?.total || 0;

        if (['select', 'radio', 'checkbox'].includes(q.type)) {
            // Get breakdown by option
            const breakdown = await query(
                `SELECT answer_text, COUNT(*) as count 
                 FROM answers WHERE question_id = ? AND answer_text IS NOT NULL
                 GROUP BY answer_text`,
                [q.id]
            ) as { answer_text: string; count: number }[];

            stat.options_breakdown = breakdown.map(b => ({
                option: b.answer_text,
                count: b.count,
                percentage: stat.total_responses > 0 ? Math.round((b.count / stat.total_responses) * 100) : 0
            }));
        } else if (['rating', 'number'].includes(q.type)) {
            // Get average value
            const avgResult = await query(
                `SELECT AVG(answer_value) as avg_val FROM answers 
                 WHERE question_id = ? AND answer_value IS NOT NULL`,
                [q.id]
            ) as { avg_val: number }[];
            stat.average_value = avgResult[0]?.avg_val || 0;

            // Also get breakdown for rating
            if (q.type === 'rating') {
                const breakdown = await query(
                    `SELECT answer_value, COUNT(*) as count 
                     FROM answers WHERE question_id = ? AND answer_value IS NOT NULL
                     GROUP BY answer_value ORDER BY answer_value`,
                    [q.id]
                ) as { answer_value: number; count: number }[];

                stat.options_breakdown = breakdown.map(b => ({
                    option: String(b.answer_value),
                    count: b.count,
                    percentage: stat.total_responses > 0 ? Math.round((b.count / stat.total_responses) * 100) : 0
                }));
            }
        } else {
            // Get text responses (limit to 50)
            const textResponses = await query(
                `SELECT answer_text FROM answers 
                 WHERE question_id = ? AND answer_text IS NOT NULL 
                 ORDER BY submitted_at DESC LIMIT 50`,
                [q.id]
            ) as { answer_text: string }[];
            stat.text_responses = textResponses.map(t => t.answer_text);
        }

        questionStats.push(stat);
    }

    return {
        questionnaire,
        totalResponses,
        questionStats
    };
}

// Legacy function for backward compatibility
export async function submitAnswers(eventId: number, answers: { questionId: number, answer: string }[]) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    try {
        if (answers.length > 0) {
            for (const a of answers) {
                await query(
                    `INSERT INTO answers (user_id, event_id, question_id, answer_text) VALUES (?, ?, ?, ?)`,
                    [session.userId, eventId, a.questionId, a.answer]
                );
            }
        }
        return { success: true };
    } catch (error) {
        console.error('Submit answers error:', error);
        return { error: 'Failed to submit answers' };
    }
}

// Get active questionnaires for users
export async function getActiveQuestionnaires(category?: string, userId?: number) {
    let sql = `
        SELECT q.*, COUNT(qu.id) as questions_count
        FROM questionnaires q
        LEFT JOIN questions qu ON q.id = qu.questionnaire_id
        WHERE q.is_active = TRUE
    `;
    const params: any[] = [];

    if (category) {
        sql += ' AND q.category = ?';
        params.push(category);
    }

    sql += ' GROUP BY q.id ORDER BY q.id DESC';

    const questionnaires = await query(sql, params) as Questionnaire[];

    // If userId provided, check which ones user has already completed
    if (userId) {
        const completed = await query(
            `SELECT DISTINCT questionnaire_id FROM questionnaire_responses 
             WHERE user_id = ? AND status = 'completed'`,
            [userId]
        ) as { questionnaire_id: number }[];

        const completedIds = new Set(completed.map(c => c.questionnaire_id));

        return questionnaires.map(q => ({
            ...q,
            is_completed: completedIds.has(q.id)
        }));
    }

    return questionnaires;
}
