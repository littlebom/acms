'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// --- Pages ---

export interface Page {
    id: number;
    slug: string;
    title_en: string;
    title_th: string | null;
    content_en: string | null;
    content_th: string | null;
    excerpt_en: string | null;
    excerpt_th: string | null;
    featured_image: string | null;
    meta_title: string | null;
    meta_description: string | null;
    template: 'default' | 'full-width' | 'sidebar' | 'landing';
    status: 'draft' | 'published' | 'archived';
    publish_date: string | null;
    created_by: number | null;
    created_at: string;
    updated_at: string;
}

export async function getPages(status?: string) {
    let sql = `
        SELECT p.*, u.first_name as author_first_name, u.last_name as author_last_name
        FROM pages p
        LEFT JOIN users u ON p.created_by = u.id
    `;
    const params: any[] = [];

    if (status) {
        sql += ' WHERE p.status = ?';
        params.push(status);
    }

    sql += ' ORDER BY p.updated_at DESC';

    const pages = await query(sql, params) as (Page & { author_first_name?: string; author_last_name?: string })[];
    return pages;
}

export async function getPage(id: number) {
    const pages = await query(
        'SELECT * FROM pages WHERE id = ?',
        [id]
    ) as Page[];
    return pages.length > 0 ? pages[0] : null;
}

export async function getPageBySlug(slug: string) {
    const pages = await query(
        'SELECT * FROM pages WHERE slug = ? AND status = ?',
        [slug, 'published']
    ) as Page[];
    return pages.length > 0 ? pages[0] : null;
}

export async function createPage(formData: FormData) {
    const session = await getSession();

    const slug = formData.get('slug') as string;
    const title_en = formData.get('title_en') as string;
    const title_th = formData.get('title_th') as string || null;
    const content_en = formData.get('content_en') as string || null;
    const content_th = formData.get('content_th') as string || null;
    const excerpt_en = formData.get('excerpt_en') as string || null;
    const excerpt_th = formData.get('excerpt_th') as string || null;
    const featured_image = formData.get('featured_image') as string || null;
    const meta_title = formData.get('meta_title') as string || null;
    const meta_description = formData.get('meta_description') as string || null;
    const template = formData.get('template') as string || 'default';
    const status = formData.get('status') as string || 'draft';

    try {
        const result = await query(
            `INSERT INTO pages 
                (slug, title_en, title_th, content_en, content_th, excerpt_en, excerpt_th, 
                 featured_image, meta_title, meta_description, template, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [slug, title_en, title_th, content_en, content_th, excerpt_en, excerpt_th,
                featured_image, meta_title, meta_description, template, status, session?.userId || null]
        ) as any;

        revalidatePath('/admin/website/pages');
        return { success: true, id: result.insertId };
    } catch (error: any) {
        console.error('Create page error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { error: 'A page with this slug already exists' };
        }
        return { error: 'Failed to create page' };
    }
}

export async function updatePage(id: number, formData: FormData) {
    const slug = formData.get('slug') as string;
    const title_en = formData.get('title_en') as string;
    const title_th = formData.get('title_th') as string || null;
    const content_en = formData.get('content_en') as string || null;
    const content_th = formData.get('content_th') as string || null;
    const excerpt_en = formData.get('excerpt_en') as string || null;
    const excerpt_th = formData.get('excerpt_th') as string || null;
    const featured_image = formData.get('featured_image') as string || null;
    const meta_title = formData.get('meta_title') as string || null;
    const meta_description = formData.get('meta_description') as string || null;
    const template = formData.get('template') as string || 'default';
    const status = formData.get('status') as string;

    try {
        await query(
            `UPDATE pages SET 
                slug = ?, title_en = ?, title_th = ?, content_en = ?, content_th = ?,
                excerpt_en = ?, excerpt_th = ?, featured_image = ?, meta_title = ?, 
                meta_description = ?, template = ?, status = ?
             WHERE id = ?`,
            [slug, title_en, title_th, content_en, content_th, excerpt_en, excerpt_th,
                featured_image, meta_title, meta_description, template, status, id]
        );

        revalidatePath('/admin/website/pages');
        revalidatePath(`/admin/website/pages/${id}`);
        revalidatePath(`/${slug}`);
        return { success: true };
    } catch (error: any) {
        console.error('Update page error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { error: 'A page with this slug already exists' };
        }
        return { error: 'Failed to update page' };
    }
}

export async function deletePage(id: number) {
    try {
        const page = await getPage(id);
        await query('DELETE FROM pages WHERE id = ?', [id]);
        revalidatePath('/admin/website/pages');
        if (page) {
            revalidatePath(`/${page.slug}`);
        }
        return { success: true };
    } catch (error) {
        console.error('Delete page error:', error);
        return { error: 'Failed to delete page' };
    }
}

export async function togglePageStatus(id: number, status: 'draft' | 'published' | 'archived') {
    try {
        await query('UPDATE pages SET status = ? WHERE id = ?', [status, id]);
        revalidatePath('/admin/website/pages');
        return { success: true };
    } catch (error) {
        console.error('Toggle page status error:', error);
        return { error: 'Failed to update page status' };
    }
}

// --- Banners ---

export interface Banner {
    id: number;
    image_url: string;
    title_en: string | null;
    title_th: string | null;
    subtitle_en: string | null;
    subtitle_th: string | null;
    button_text_en: string | null;
    button_text_th: string | null;
    button_link: string | null;
    display_order: number;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
}

export async function getBanners(activeOnly: boolean = false) {
    let sql = 'SELECT * FROM banners';
    if (activeOnly) {
        sql += ' WHERE is_active = TRUE AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())';
    }
    sql += ' ORDER BY display_order ASC';

    const banners = await query(sql) as Banner[];
    return banners;
}

export async function getBanner(id: number) {
    const banners = await query('SELECT * FROM banners WHERE id = ?', [id]) as Banner[];
    return banners.length > 0 ? banners[0] : null;
}

export async function createBanner(formData: FormData) {
    const image_url = formData.get('image_url') as string;
    const title_en = formData.get('title_en') as string || null;
    const title_th = formData.get('title_th') as string || null;
    const subtitle_en = formData.get('subtitle_en') as string || null;
    const subtitle_th = formData.get('subtitle_th') as string || null;
    const button_text_en = formData.get('button_text_en') as string || null;
    const button_text_th = formData.get('button_text_th') as string || null;
    const button_link = formData.get('button_link') as string || null;
    const display_order = parseInt(formData.get('display_order') as string) || 0;

    try {
        await query(
            `INSERT INTO banners 
                (image_url, title_en, title_th, subtitle_en, subtitle_th, 
                 button_text_en, button_text_th, button_link, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [image_url, title_en, title_th, subtitle_en, subtitle_th,
                button_text_en, button_text_th, button_link, display_order]
        );
        revalidatePath('/admin/website/banners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Create banner error:', error);
        return { error: 'Failed to create banner' };
    }
}

export async function updateBanner(id: number, formData: FormData) {
    const image_url = formData.get('image_url') as string;
    const title_en = formData.get('title_en') as string || null;
    const title_th = formData.get('title_th') as string || null;
    const subtitle_en = formData.get('subtitle_en') as string || null;
    const subtitle_th = formData.get('subtitle_th') as string || null;
    const button_text_en = formData.get('button_text_en') as string || null;
    const button_text_th = formData.get('button_text_th') as string || null;
    const button_link = formData.get('button_link') as string || null;
    const display_order = parseInt(formData.get('display_order') as string) || 0;
    const is_active = formData.get('is_active') === 'on';

    try {
        await query(
            `UPDATE banners SET 
                image_url = ?, title_en = ?, title_th = ?, subtitle_en = ?, subtitle_th = ?,
                button_text_en = ?, button_text_th = ?, button_link = ?, display_order = ?, is_active = ?
             WHERE id = ?`,
            [image_url, title_en, title_th, subtitle_en, subtitle_th,
                button_text_en, button_text_th, button_link, display_order, is_active, id]
        );
        revalidatePath('/admin/website/banners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Update banner error:', error);
        return { error: 'Failed to update banner' };
    }
}

export async function deleteBanner(id: number) {
    try {
        await query('DELETE FROM banners WHERE id = ?', [id]);
        revalidatePath('/admin/website/banners');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Delete banner error:', error);
        return { error: 'Failed to delete banner' };
    }
}

// --- Menu Items ---

export interface MenuItem {
    id: number;
    menu_location: 'header' | 'footer' | 'sidebar';
    parent_id: number | null;
    title_en: string;
    title_th: string | null;
    url: string;
    target: '_self' | '_blank';
    icon: string | null;
    display_order: number;
    is_active: boolean;
    children?: MenuItem[];
}

export async function getMenuItems(location?: string) {
    let sql = 'SELECT * FROM menu_items WHERE is_active = TRUE';
    const params: any[] = [];

    if (location) {
        sql += ' AND menu_location = ?';
        params.push(location);
    }

    sql += ' ORDER BY display_order ASC';

    const items = await query(sql, params) as MenuItem[];

    // Build tree structure
    const itemMap = new Map<number, MenuItem>();
    const rootItems: MenuItem[] = [];

    items.forEach(item => {
        item.children = [];
        itemMap.set(item.id, item);
    });

    items.forEach(item => {
        if (item.parent_id && itemMap.has(item.parent_id)) {
            itemMap.get(item.parent_id)!.children!.push(item);
        } else {
            rootItems.push(item);
        }
    });

    return rootItems;
}

export async function getAllMenuItems() {
    const items = await query('SELECT * FROM menu_items ORDER BY menu_location, display_order ASC') as MenuItem[];
    return items;
}

export async function createMenuItem(formData: FormData) {
    const menu_location = formData.get('menu_location') as string;
    const parent_id = formData.get('parent_id') ? parseInt(formData.get('parent_id') as string) : null;
    const title_en = formData.get('title_en') as string;
    const title_th = formData.get('title_th') as string || null;
    const url = formData.get('url') as string;
    const target = formData.get('target') as string || '_self';
    const display_order = parseInt(formData.get('display_order') as string) || 0;

    try {
        await query(
            `INSERT INTO menu_items (menu_location, parent_id, title_en, title_th, url, target, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [menu_location, parent_id, title_en, title_th, url, target, display_order]
        );
        revalidatePath('/admin/website/menus');
        return { success: true };
    } catch (error) {
        console.error('Create menu item error:', error);
        return { error: 'Failed to create menu item' };
    }
}

export async function updateMenuItem(id: number, formData: FormData) {
    const title_en = formData.get('title_en') as string;
    const title_th = formData.get('title_th') as string || null;
    const url = formData.get('url') as string;
    const target = formData.get('target') as string || '_self';
    const display_order = parseInt(formData.get('display_order') as string) || 0;
    const is_active = formData.get('is_active') === 'on';

    try {
        await query(
            `UPDATE menu_items SET title_en = ?, title_th = ?, url = ?, target = ?, display_order = ?, is_active = ?
             WHERE id = ?`,
            [title_en, title_th, url, target, display_order, is_active, id]
        );
        revalidatePath('/admin/website/menus');
        return { success: true };
    } catch (error) {
        console.error('Update menu item error:', error);
        return { error: 'Failed to update menu item' };
    }
}

export async function deleteMenuItem(id: number) {
    try {
        await query('DELETE FROM menu_items WHERE id = ?', [id]);
        revalidatePath('/admin/website/menus');
        return { success: true };
    } catch (error) {
        console.error('Delete menu item error:', error);
        return { error: 'Failed to delete menu item' };
    }
}

// --- Site Settings ---

export interface SiteSetting {
    id: number;
    setting_key: string;
    setting_value: string | null;
    setting_type: string;
    category: string;
}

export async function getSiteSettings(category?: string) {
    let sql = 'SELECT * FROM site_settings';
    const params: any[] = [];

    if (category) {
        sql += ' WHERE category = ?';
        params.push(category);
    }

    sql += ' ORDER BY category, setting_key';

    const settings = await query(sql, params) as SiteSetting[];
    return settings;
}

export async function getSiteSetting(key: string) {
    const settings = await query(
        'SELECT setting_value FROM site_settings WHERE setting_key = ?',
        [key]
    ) as { setting_value: string }[];
    return settings.length > 0 ? settings[0].setting_value : null;
}

export async function updateSiteSettings(settings: { key: string; value: string }[]) {
    try {
        for (const setting of settings) {
            await query(
                'UPDATE site_settings SET setting_value = ? WHERE setting_key = ?',
                [setting.value, setting.key]
            );
        }
        revalidatePath('/admin/website/settings');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Update site settings error:', error);
        return { error: 'Failed to update settings' };
    }
}
