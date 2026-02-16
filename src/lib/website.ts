import { query } from './db';

export interface Page {
    id: number;
    slug: string;
    title_en: string;
    title_th?: string;
    content_en: string;
    content_th?: string;
    template: 'default' | 'full-width' | 'sidebar' | 'landing';
    status: 'draft' | 'published' | 'archived';
    featured_image?: string;
    meta_title?: string;
    meta_description?: string;
    created_at: Date;
    updated_at: Date;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
    try {
        const rows = await query(
            'SELECT * FROM pages WHERE slug = ? LIMIT 1',
            [slug]
        ) as any[];
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error(`Error fetching page with slug ${slug}:`, error);
        return null;
    }
}
