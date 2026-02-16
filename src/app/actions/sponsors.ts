'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export interface Sponsor {
    id: number;
    name_th: string;
    name_en: string;
    logo_url: string | null;
    website_url: string | null;
    contact_number: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface SponsorUser {
    sponsor_id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
}

export async function getSponsors() {
    return await query('SELECT * FROM sponsors ORDER BY id ASC') as Sponsor[];
}

export async function getSponsor(id: number) {
    const sponsors = await query('SELECT * FROM sponsors WHERE id = ?', [id]) as Sponsor[];
    return sponsors.length > 0 ? sponsors[0] : null;
}

export async function createSponsor(formData: FormData) {
    const name_th = formData.get('name_th') as string;
    const name_en = formData.get('name_en') as string;
    const website_url = formData.get('website_url') as string;
    const contact_number = formData.get('contact_number') as string;
    const logoFile = formData.get('logo') as File;

    try {
        let logo_url = null;

        if (logoFile && logoFile.size > 0) {
            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `sponsor-logo-${Date.now()}-${logoFile.name}`;
            const path = join(process.cwd(), 'public/uploads', fileName);
            await writeFile(path, buffer);
            logo_url = `/uploads/${fileName}`;
        }

        const result = await query(
            'INSERT INTO sponsors (name_th, name_en, logo_url, website_url, contact_number) VALUES (?, ?, ?, ?, ?)',
            [name_th, name_en, logo_url, website_url, contact_number]
        ) as any;

        revalidatePath('/admin/engagement/sponsors');
        revalidatePath('/sponsors');
        return { success: true, id: result.insertId };
    } catch (error) {
        console.error('Create sponsor error:', error);
        return { error: 'Failed to create sponsor' };
    }
}

export async function updateSponsor(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const name_th = formData.get('name_th') as string;
    const name_en = formData.get('name_en') as string;
    const website_url = formData.get('website_url') as string;
    const contact_number = formData.get('contact_number') as string;
    const logoFile = formData.get('logo') as File;

    try {
        let logo_url = formData.get('current_logo_url') as string || null;

        if (logoFile && logoFile.size > 0) {
            const bytes = await logoFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `sponsor-logo-${Date.now()}-${logoFile.name}`;
            const path = join(process.cwd(), 'public/uploads', fileName);
            await writeFile(path, buffer);
            logo_url = `/uploads/${fileName}`;
        }

        await query(
            'UPDATE sponsors SET name_th = ?, name_en = ?, logo_url = ?, website_url = ?, contact_number = ? WHERE id = ?',
            [name_th, name_en, logo_url, website_url, contact_number, id]
        );

        revalidatePath('/admin/engagement/sponsors');
        revalidatePath(`/admin/engagement/sponsors/${id}/edit`);
        revalidatePath('/sponsors');
        return { success: true };
    } catch (error) {
        console.error('Update sponsor error:', error);
        return { error: 'Failed to update sponsor' };
    }
}

export async function deleteSponsor(id: number) {
    try {
        await query('DELETE FROM sponsors WHERE id = ?', [id]);
        revalidatePath('/admin/engagement/sponsors');
        revalidatePath('/sponsors');
        return { success: true };
    } catch (error) {
        console.error('Delete sponsor error:', error);
        return { error: 'Failed to delete sponsor' };
    }
}

export async function getSponsorUsers(sponsorId: number) {
    return await query(`
        SELECT su.sponsor_id, u.id as user_id, u.first_name, u.last_name, u.email, u.role
        FROM sponsor_users su
        JOIN users u ON su.user_id = u.id
        WHERE su.sponsor_id = ?
    `, [sponsorId]) as SponsorUser[];
}

export async function addSponsorUser(sponsorId: number, userId: number) {
    try {
        await query('INSERT INTO sponsor_users (sponsor_id, user_id) VALUES (?, ?)', [sponsorId, userId]);
        revalidatePath(`/admin/engagement/sponsors/${sponsorId}/edit`);
        return { success: true };
    } catch (error) {
        console.error('Add sponsor user error:', error);
        return { error: 'Failed to add user to sponsor' };
    }
}

export async function removeSponsorUser(sponsorId: number, userId: number) {
    try {
        await query('DELETE FROM sponsor_users WHERE sponsor_id = ? AND user_id = ?', [sponsorId, userId]);
        revalidatePath(`/admin/engagement/sponsors/${sponsorId}/edit`);
        return { success: true };
    } catch (error) {
        console.error('Remove sponsor user error:', error);
        return { error: 'Failed to remove user from sponsor' };
    }
}
