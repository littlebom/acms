'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSystemSettings } from './settings';

export interface ChatbotFaq {
    id: number;
    question: string;
    answer: string;
    is_active: boolean;
    created_at: string;
}

export interface ChatbotSettings {
    chatbot_name: string;
    chatbot_enabled: boolean;
    chatbot_provider: 'rule_based' | 'gemini' | 'openai';
    chatbot_gemini_api_key: string;
    chatbot_gemini_model: string;
    chatbot_openai_api_key: string;
    chatbot_openai_model: string;
    chatbot_system_prompt: string;
}

// ─── Admin: FAQ CRUD ──────────────────────────────────────────────────────────

export async function getFaqs(showInactive = true) {
    try {
        let sql = 'SELECT * FROM chatbot_faqs';
        if (!showInactive) sql += ' WHERE is_active = TRUE';
        sql += ' ORDER BY created_at DESC';
        const faqs = await query(sql) as any[];
        return faqs.map(f => ({
            ...f,
            is_active: Boolean(f.is_active),
            created_at: f.created_at.toISOString(),
        })) as ChatbotFaq[];
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return [];
    }
}

export async function saveFaq(data: { id?: number; question: string; answer: string; is_active?: boolean }) {
    try {
        if (data.id) {
            await query('UPDATE chatbot_faqs SET question = ?, answer = ?, is_active = ? WHERE id = ?',
                [data.question, data.answer, data.is_active ?? true, data.id]);
        } else {
            await query('INSERT INTO chatbot_faqs (question, answer, is_active) VALUES (?, ?, ?)',
                [data.question, data.answer, data.is_active ?? true]);
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

// ─── Admin: Chatbot Settings ──────────────────────────────────────────────────

export async function saveChatbotSettings(data: ChatbotSettings) {
    try {
        await query(
            `UPDATE system_settings SET
                chatbot_name = ?,
                chatbot_enabled = ?,
                chatbot_provider = ?,
                chatbot_gemini_api_key = ?,
                chatbot_gemini_model = ?,
                chatbot_openai_api_key = ?,
                chatbot_openai_model = ?,
                chatbot_system_prompt = ?
            WHERE id = 1`,
            [
                data.chatbot_name || 'AI Assistant',
                data.chatbot_enabled ? 1 : 0,
                data.chatbot_provider,
                data.chatbot_gemini_api_key || null,
                data.chatbot_gemini_model || 'gemini-2.0-flash',
                data.chatbot_openai_api_key || null,
                data.chatbot_openai_model || 'gpt-4o-mini',
                data.chatbot_system_prompt || null,
            ]
        );
        revalidatePath('/admin/engagement/chatbot');
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error('Error saving chatbot settings:', error);
        return { success: false, error: 'Failed to save settings' };
    }
}

// ─── Admin: Generate Pre-computed RAG Context ─────────────────────────────────

export async function generateRagContext(): Promise<{ success: boolean; context?: string; error?: string }> {
    try {
        const [events, faqs, newsItems, sponsors] = await Promise.all([
            query(`SELECT name_en, start_date, end_date, venue_name, address,
                          description, submission_deadline, registration_deadline, contact_email, id
                   FROM events WHERE is_active = TRUE LIMIT 1`) as Promise<any[]>,
            query(`SELECT question, answer FROM chatbot_faqs WHERE is_active = TRUE`) as Promise<any[]>,
            query(`SELECT title, content FROM news WHERE is_published = TRUE ORDER BY created_at DESC LIMIT 5`) as Promise<any[]>,
            query(`SELECT name_en FROM sponsors ORDER BY id ASC LIMIT 10`) as Promise<any[]>,
        ]);

        let sessions: any[] = [];
        try {
            sessions = await query(`
                SELECT s.title, s.start_time, s.end_time, s.room, s.type
                FROM sessions s
                JOIN schedules sch ON s.schedule_id = sch.id
                JOIN events e ON sch.event_id = e.id
                WHERE e.is_active = TRUE
                ORDER BY s.start_time ASC LIMIT 30
            `) as any[];
        } catch { /* schedule not linked */ }

        let speakers: any[] = [];
        const eventId = events[0]?.id;
        if (eventId) {
            try {
                speakers = await query(`
                    SELECT u.first_name, u.last_name, u.bio, ep.organization, ep.title as ep_title
                    FROM event_participants ep
                    JOIN users u ON ep.user_id = u.id
                    WHERE ep.event_id = ? AND ep.role = 'speaker'
                    LIMIT 20
                `, [eventId]) as any[];
            } catch { /* table may differ */ }
        }

        const event = events[0];
        const fmt = (d: any) => d
            ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : 'TBA';

        let context = '=== CONFERENCE INFORMATION ===\n';
        if (event) {
            context += `Name: ${event.name_en}\n`;
            context += `Date: ${fmt(event.start_date)}${event.end_date ? ' – ' + fmt(event.end_date) : ''}\n`;
            context += `Venue: ${event.venue_name || 'TBA'}\n`;
            if (event.address) context += `Address: ${event.address}\n`;
            if (event.contact_email) context += `Contact Email: ${event.contact_email}\n`;
            if (event.submission_deadline) context += `Paper Submission Deadline: ${fmt(event.submission_deadline)}\n`;
            if (event.registration_deadline) context += `Registration Deadline: ${fmt(event.registration_deadline)}\n`;
        } else {
            context += 'No active event found.\n';
        }

        if (speakers.length > 0) {
            context += '\n=== SPEAKERS ===\n';
            for (const s of speakers) {
                context += `- ${s.first_name} ${s.last_name}`;
                if (s.ep_title) context += ` (${s.ep_title})`;
                if (s.organization) context += `, ${s.organization}`;
                if (s.bio) context += `\n  ${String(s.bio).replace(/<[^>]*>/g, '').substring(0, 150)}`;
                context += '\n';
            }
        }

        if (sessions.length > 0) {
            context += '\n=== SCHEDULE / SESSIONS ===\n';
            for (const s of sessions) {
                const start = s.start_time
                    ? new Date(s.start_time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '';
                context += `- [${(s.type || 'session').toUpperCase()}] ${s.title}`;
                if (start) context += ` | ${start}`;
                if (s.room) context += ` | Room: ${s.room}`;
                context += '\n';
            }
        }

        if (faqs.length > 0) {
            context += '\n=== FREQUENTLY ASKED QUESTIONS ===\n';
            for (const f of faqs) {
                context += `Q: ${f.question}\nA: ${f.answer}\n\n`;
            }
        }

        if (newsItems.length > 0) {
            context += '\n=== LATEST NEWS ===\n';
            for (const n of newsItems) {
                const plain = String(n.content || '').replace(/<[^>]*>/g, '').substring(0, 200);
                context += `- ${n.title}: ${plain}\n`;
            }
        }

        if (sponsors.length > 0) {
            context += '\n=== SPONSORS ===\n';
            context += sponsors.map((s: any) => s.name_en).join(', ') + '\n';
        }

        await query(
            `UPDATE system_settings SET chatbot_context = ?, chatbot_context_updated_at = NOW() WHERE id = 1`,
            [context]
        );
        revalidatePath('/admin/engagement/chatbot');
        return { success: true, context };
    } catch (error) {
        console.error('Error generating RAG context:', error);
        return { success: false, error: 'Failed to generate context' };
    }
}

// ─── AI Provider Helpers ──────────────────────────────────────────────────────

async function chatWithGemini(message: string, context: string, settings: any): Promise<{ reply: string }> {
    const apiKey = settings.chatbot_gemini_api_key;
    const model = settings.chatbot_gemini_model || 'gemini-2.0-flash';
    const sysPrompt = settings.chatbot_system_prompt ||
        `You are a helpful AI assistant for this conference. Answer questions based ONLY on the provided context below. Be concise and friendly. If the answer is not in the context, say you don't have that information. Reply in the same language the user uses.`;

    const fullPrompt = `${sysPrompt}\n\n${context}\n\n---\nUser: ${message}`;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
            }),
        }
    );
    if (!res.ok) throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return { reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process your request." };
}

async function chatWithOpenAI(message: string, context: string, settings: any): Promise<{ reply: string }> {
    const apiKey = settings.chatbot_openai_api_key;
    const model = settings.chatbot_openai_model || 'gpt-4o-mini';
    const sysContent = (settings.chatbot_system_prompt ||
        `You are a helpful AI assistant for this conference. Answer questions based ONLY on the provided context. Be concise and friendly. If the answer is not in the context, say you don't have that information. Reply in the same language the user uses.`)
        + '\n\n' + context;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: sysContent }, { role: 'user', content: message }],
            max_tokens: 512,
            temperature: 0.7,
        }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return { reply: data.choices?.[0]?.message?.content || "Sorry, I couldn't process your request." };
}

async function chatWithRuleBased(userMessage: string): Promise<{ reply: string }> {
    const message = userMessage.toLowerCase().trim();
    const faqs = await query('SELECT * FROM chatbot_faqs WHERE is_active = TRUE') as any[];

    // Detect if message contains Thai characters (Unicode U+0E00–U+0E7F)
    const isThai = /[\u0E00-\u0E7F]/.test(message);

    // ── Fix 2 & 3: Dual matching strategy ─────────────────────────────────────
    let bestMatch: any = null;
    let maxScore = 0;

    for (const faq of faqs) {
        const faqQ = faq.question.toLowerCase();
        let score = 0;

        if (isThai) {
            // Thai: character n-gram matching (3-char sliding window)
            // Thai has no word spaces, so we match overlapping 3-char sequences
            for (let i = 0; i <= faqQ.length - 3; i++) {
                const gram = faqQ.substring(i, i + 3).trim();
                if (gram.length === 3 && message.includes(gram)) score++;
            }
            // Bonus: direct substring containment in either direction
            if (message.includes(faqQ) || faqQ.includes(message)) score += 5;
        } else {
            // English: word-based matching (existing logic, improved threshold)
            const words = faqQ.split(/[\s,.!?]+/).filter((w: string) => w.length > 3);
            for (const word of words) {
                if (message.includes(word)) score++;
            }
        }

        if (score > maxScore) { maxScore = score; bestMatch = faq; }
    }

    // Thai needs at least 2 n-gram matches to avoid false positives
    const matchThreshold = isThai ? 2 : 1;
    if (bestMatch && maxScore >= matchThreshold) return { reply: bestMatch.answer };

    // ── Fix 1: Thai + English keywords for smart DB queries ───────────────────
    const eventKeywords = [
        // English
        'event', 'schedule', 'conference', 'when', 'date', 'venue', 'where', 'start',
        // Thai
        'งาน', 'เริ่ม', 'เมื่อไหร่', 'วันที่', 'กำหนดการ', 'สถานที่', 'ที่ไหน',
        'จัดงาน', 'ตาราง', 'เวลา', 'จัด', 'ประชุม', 'วัน', 'ปี',
    ];

    const registerKeywords = [
        'register', 'registration', 'sign up', 'signup', 'enroll',
        'ลงทะเบียน', 'สมัคร', 'สมัครเข้าร่วม',
    ];

    const contactKeywords = [
        'contact', 'email', 'phone', 'support', 'help',
        'ติดต่อ', 'อีเมล', 'โทร', 'สอบถาม',
    ];

    if (eventKeywords.some(k => message.includes(k))) {
        const evts = await query(
            `SELECT name_en, start_date, end_date, venue_name
             FROM events WHERE is_active = TRUE ORDER BY start_date ASC LIMIT 3`
        ) as any[];
        if (evts.length > 0) {
            let reply = "Here are the upcoming events:\n\n";
            for (const e of evts) {
                const start = new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const end = e.end_date ? ' – ' + new Date(e.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                reply += `📅 **${e.name_en}**\n   Date: ${start}${end}\n   Venue: ${e.venue_name || 'TBA'}\n\n`;
            }
            return { reply: reply.trim() };
        }
    }

    if (registerKeywords.some(k => message.includes(k))) {
        return { reply: "You can register by clicking the 'Register' button in the top navigation, or visit the registration page directly.\n\nสามารถลงทะเบียนได้โดยคลิกปุ่ม 'Register' ที่เมนูด้านบน หรือเข้าหน้าลงทะเบียนโดยตรง" };
    }

    if (contactKeywords.some(k => message.includes(k))) {
        const settings = await query('SELECT contact_email, contact_phone FROM system_settings WHERE id = 1') as any[];
        const s = settings[0];
        if (s?.contact_email || s?.contact_phone) {
            let reply = "You can contact us:\n";
            if (s.contact_email) reply += `📧 Email: ${s.contact_email}\n`;
            if (s.contact_phone) reply += `📞 Phone: ${s.contact_phone}\n`;
            return { reply };
        }
    }

    return { reply: "I'm sorry, I couldn't find an answer to that. Please try asking differently or contact our support team.\n\nขออภัย ไม่พบคำตอบสำหรับคำถามนี้ กรุณาลองถามใหม่หรือติดต่อทีมงานโดยตรง" };
}

// ─── Main Public Entry Point ──────────────────────────────────────────────────

export async function chatWithBot(userMessage: string): Promise<{ reply: string }> {
    try {
        const settings = await getSystemSettings();

        if (!settings.chatbot_enabled) {
            return { reply: "The assistant is currently unavailable. Please contact us directly." };
        }

        const provider = settings.chatbot_provider || 'rule_based';
        const context = settings.chatbot_context || '';

        if (provider === 'gemini' && settings.chatbot_gemini_api_key) {
            try { return await chatWithGemini(userMessage, context, settings); }
            catch (e) { console.error('Gemini failed, falling back:', e); }
        }

        if (provider === 'openai' && settings.chatbot_openai_api_key) {
            try { return await chatWithOpenAI(userMessage, context, settings); }
            catch (e) { console.error('OpenAI failed, falling back:', e); }
        }

        return await chatWithRuleBased(userMessage);
    } catch (error) {
        console.error('Chatbot error:', error);
        return { reply: "I'm having trouble connecting right now. Please try again later." };
    }
}
