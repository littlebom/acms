'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface ChatbotFaq {
    id: number;
    question: string;
    answer: string;
    is_active: boolean;
    created_at: string;
}

// --- Admin Actions ---

export async function getFaqs(showInactive = true) {
    try {
        let sql = 'SELECT * FROM chatbot_faqs';
        if (!showInactive) {
            sql += ' WHERE is_active = TRUE';
        }
        sql += ' ORDER BY created_at DESC';

        const faqs = await query(sql) as any[];
        return faqs.map(f => ({
            ...f,
            is_active: Boolean(f.is_active),
            created_at: f.created_at.toISOString()
        })) as ChatbotFaq[];
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return [];
    }
}

export async function saveFaq(data: { id?: number, question: string, answer: string, is_active?: boolean }) {
    try {
        if (data.id) {
            // Update
            await query(
                'UPDATE chatbot_faqs SET question = ?, answer = ?, is_active = ? WHERE id = ?',
                [data.question, data.answer, data.is_active ?? true, data.id]
            );
        } else {
            // Create
            await query(
                'INSERT INTO chatbot_faqs (question, answer, is_active) VALUES (?, ?, ?)',
                [data.question, data.answer, data.is_active ?? true]
            );
        }
        revalidatePath('/admin/engagement/chatbot');
        return { success: true };
    } catch (error) {
        console.error('Error saving FAQ:', error);
        return { success: false, error: 'Failed to save FAQ' };
    }
}

export async function deleteFaq(id: number) {
    try {
        await query('DELETE FROM chatbot_faqs WHERE id = ?', [id]);
        revalidatePath('/admin/engagement/chatbot');
        return { success: true };
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        return { success: false, error: 'Failed to delete FAQ' };
    }
}

export async function toggleFaqStatus(id: number, currentStatus: boolean) {
    try {
        await query('UPDATE chatbot_faqs SET is_active = ? WHERE id = ?', [!currentStatus, id]);
        revalidatePath('/admin/engagement/chatbot');
        return { success: true };
    } catch (error) {
        console.error('Error toggling FAQ status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

// --- Frontend Bot Logic ---

export async function chatWithBot(userMessage: string): Promise<{ reply: string }> {
    try {
        const message = userMessage.toLowerCase().trim();

        // 1. Exact or Like Match from DB
        const faqs = await query(
            'SELECT * FROM chatbot_faqs WHERE is_active = TRUE'
        ) as any[];

        // Simple scoring mechanism (word overlap)
        let bestMatch = null;
        let maxScore = 0;

        for (const faq of faqs) {
            const questionWords = faq.question.toLowerCase().split(/\s+/);
            let score = 0;
            for (const word of questionWords) {
                if (message.includes(word) && word.length > 3) { // ignore short words
                    score++;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestMatch = faq;
            }
        }

        if (bestMatch && maxScore > 0) {
            return { reply: bestMatch.answer };
        }

        // 2. Smart Actions (Dynamic DB Query)
        // Check for Event/Schedule intent
        if (message.includes('event') || message.includes('schedule') || message.includes('conference') || message.includes('when')) {
            const events = await query(
                'SELECT name_en, start_date, venue_name FROM events WHERE is_active = TRUE AND start_date >= CURRENT_DATE() ORDER BY start_date ASC LIMIT 3'
            ) as any[];

            if (events.length > 0) {
                let reply = "Here are the upcoming events:\n\n";
                events.forEach(e => {
                    const date = new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    reply += `📅 **${e.name_en}**\n   Date: ${date}\n   Venue: ${e.venue_name || 'TBA'}\n\n`;
                });
                return { reply: reply.trim() };
            }
        }

        // 2. Default fallback
        return {
            reply: "I'm sorry, I couldn't find an answer to that. Please try asking differently or contact our support team."
        };

    } catch (error) {
        console.error('Chatbot error:', error);
        return { reply: "I'm having trouble connecting to my brain right now. Please try again later." };
    }
}
