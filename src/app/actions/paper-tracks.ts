'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';

// =====================================================
// Types
// =====================================================

export interface PaperTrack {
    id: number;
    name: string;
    name_th?: string;
    description?: string;
    is_active: boolean;
    created_at: Date;
}

// =====================================================
// Paper Tracks CRUD
// =====================================================

export async function getPaperTracks(activeOnly: boolean = false) {
    let sql = 'SELECT * FROM paper_tracks';
    if (activeOnly) {
        sql += ' WHERE is_active = TRUE';
    }
    sql += ' ORDER BY name ASC';

    return await query(sql) as PaperTrack[];
}

export async function getPaperTrack(id: number) {
    const result = await query('SELECT * FROM paper_tracks WHERE id = ?', [id]) as PaperTrack[];
    return result.length > 0 ? result[0] : null;
}

export async function createPaperTrack(formData: FormData) {
    const name = formData.get('name') as string;
    const name_th = formData.get('name_th') as string;
    const description = formData.get('description') as string;

    try {
        await query(
            'INSERT INTO paper_tracks (name, name_th, description) VALUES (?, ?, ?)',
            [name, name_th || null, description || null]
        );
        revalidatePath('/admin/papers/tracks');
        return { success: true };
    } catch (error) {
        console.error('Create paper track error:', error);
        return { error: 'Failed to create track' };
    }
}

export async function updatePaperTrack(formData: FormData) {
    const id = formData.get('id');
    const name = formData.get('name') as string;
    const name_th = formData.get('name_th') as string;
    const description = formData.get('description') as string;
    const is_active = formData.get('is_active') === 'true';

    try {
        await query(
            'UPDATE paper_tracks SET name = ?, name_th = ?, description = ?, is_active = ? WHERE id = ?',
            [name, name_th || null, description || null, is_active, id]
        );
        revalidatePath('/admin/papers/tracks');
        return { success: true };
    } catch (error) {
        console.error('Update paper track error:', error);
        return { error: 'Failed to update track' };
    }
}

export async function deletePaperTrack(id: number) {
    try {
        // Check if track has papers
        const papers = await query('SELECT id FROM papers WHERE track_id = ?', [id]) as any[];
        if (papers.length > 0) {
            return { error: 'Cannot delete track with existing papers' };
        }

        await query('DELETE FROM paper_tracks WHERE id = ?', [id]);
        revalidatePath('/admin/papers/tracks');
        return { success: true };
    } catch (error) {
        console.error('Delete paper track error:', error);
        return { error: 'Failed to delete track' };
    }
}
