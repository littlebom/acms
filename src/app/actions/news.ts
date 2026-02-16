'use server';

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type NewsItem = {
    id: number;
    title: string;
    content: string;
    image_url: string | null;
    is_published: boolean;
    created_at: string;
    updated_at: string;
};

export async function getNews(searchQuery?: string, onlyPublished: boolean = false) {
    try {
        let sql = 'SELECT * FROM news';
        const params: any[] = [];
        const conditions: string[] = [];

        if (searchQuery) {
            conditions.push('(title LIKE ? OR content LIKE ?)');
            const term = `%${searchQuery}%`;
            params.push(term, term);
        }

        if (onlyPublished) {
            conditions.push('is_published = TRUE');
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY created_at DESC';

        const news = await query(sql, params) as NewsItem[];
        return { news };
    } catch (error) {
        console.error('Get news error:', error);
        return { error: 'Failed to fetch news' };
    }
}

export async function getNewsById(id: number) {
    try {
        const news = await query('SELECT * FROM news WHERE id = ?', [id]) as NewsItem[];
        if (news.length === 0) return { error: 'News not found' };
        return { news: news[0] };
    } catch (error) {
        console.error('Get news by id error:', error);
        return { error: 'Failed to fetch news details' };
    }
}

export async function createNews(data: { title: string; content: string; image_url?: string; is_published: boolean }) {
    try {
        const { title, content, image_url, is_published } = data;
        await query(
            'INSERT INTO news (title, content, image_url, is_published) VALUES (?, ?, ?, ?)',
            [title, content, image_url || null, is_published]
        );
        revalidatePath('/admin/engagement/news');
        return { success: true };
    } catch (error) {
        console.error('Create news error:', error);
        return { error: 'Failed to create news' };
    }
}

export async function updateNews(id: number, data: { title: string; content: string; image_url?: string; is_published: boolean }) {
    try {
        const { title, content, image_url, is_published } = data;
        await query(
            'UPDATE news SET title = ?, content = ?, image_url = ?, is_published = ? WHERE id = ?',
            [title, content, image_url || null, is_published, id]
        );
        revalidatePath('/admin/engagement/news');
        revalidatePath(`/admin/engagement/news/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Update news error:', error);
        return { error: 'Failed to update news' };
    }
}

export async function deleteNews(id: number) {
    try {
        await query('DELETE FROM news WHERE id = ?', [id]);
        revalidatePath('/admin/engagement/news');
        return { success: true };
    } catch (error) {
        console.error('Delete news error:', error);
        return { error: 'Failed to delete news' };
    }
}
