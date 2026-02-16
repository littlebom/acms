'use server';

import { revalidatePath } from 'next/cache';
import { query } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import bcrypt from 'bcryptjs';

export interface SpeakerGroup {
    id: number;
    name: string;
    description: string | null;
    event_id: number | null;
    event_title?: string;
    member_count?: number;
}

export interface SpeakerGroupMember {
    group_id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string | null;
    bio?: string;
    display_order?: number;
}

export interface Speaker {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string | null;
    bio: string | null;
}

// --- Speaker Groups ---

export async function getSpeakerGroups() {
    const groups = await query(`
        SELECT sg.id, sg.title as name, sg.description, sg.event_id, 
               e.name_en as event_title, COUNT(sgm.user_id) as member_count 
        FROM speaker_groups sg
        LEFT JOIN events e ON sg.event_id = e.id
        LEFT JOIN speaker_group_members sgm ON sg.id = sgm.group_id
        GROUP BY sg.id
        ORDER BY sg.id DESC
    `) as SpeakerGroup[];
    return groups;
}

export async function getSpeakerGroup(id: number) {
    const groups = await query(`
        SELECT sg.id, sg.title as name, sg.description, sg.event_id,
               e.name_en as event_title 
        FROM speaker_groups sg
        LEFT JOIN events e ON sg.event_id = e.id
        WHERE sg.id = ?
    `, [id]) as SpeakerGroup[];
    return groups.length > 0 ? groups[0] : null;
}

export async function getSpeakerDetails(userId: number, groupId?: number) {
    let sql = `
        SELECT u.id as user_id, u.first_name, u.last_name, u.email, 
               u.bio, u.title, u.profile_image, u.organization, u.country
    `;
    const params: any[] = [userId];

    if (groupId) {
        sql += `, sgm.display_order
                FROM users u
                LEFT JOIN speaker_group_members sgm ON u.id = sgm.user_id AND sgm.group_id = ?
        `;
        params.unshift(groupId);
    } else {
        sql += ' FROM users u';
    }

    sql += ' WHERE u.id = ?';

    const speakers = await query(sql, params) as SpeakerGroupMember[];
    return speakers.length > 0 ? speakers[0] : null;
}

export async function createSpeakerGroup(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
        // Create standalone Speaker Group
        const result = await query(
            'INSERT INTO speaker_groups (title, description, event_id) VALUES (?, ?, NULL)',
            [name, description || 'No description provided']
        ) as any;

        revalidatePath('/admin/speakers');
        return { success: true, groupId: result.insertId };
    } catch (error) {
        console.error('Create speaker group error:', error);
        return { error: 'Failed to create speaker group' };
    }
}

export async function deleteSpeakerGroup(id: number) {
    try {
        // Unlink from event first
        await query('UPDATE events SET speaker_group_id = NULL WHERE speaker_group_id = ?', [id]);
        await query('DELETE FROM speaker_groups WHERE id = ?', [id]);
        revalidatePath('/admin/speakers');
        return { success: true };
    } catch (error) {
        console.error('Delete speaker group error:', error);
        return { error: 'Failed to delete speaker group' };
    }
}

export async function updateSpeakerGroup(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
        await query(
            'UPDATE speaker_groups SET title = ?, description = ? WHERE id = ?',
            [name, description || '', id]
        );
        revalidatePath('/admin/speakers');
        revalidatePath(`/admin/speakers/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Update speaker group error:', error);
        return { error: 'Failed to update speaker group' };
    }
}

// --- Members ---

export async function getGroupMembers(groupId: number) {
    const members = await query(`
        SELECT sgm.group_id, u.id as user_id, u.first_name, u.last_name, u.email, u.profile_image, u.bio, u.title, sgm.display_order
        FROM speaker_group_members sgm
        JOIN users u ON sgm.user_id = u.id
        WHERE sgm.group_id = ?
        ORDER BY sgm.display_order ASC, u.id ASC
    `, [groupId]) as SpeakerGroupMember[];
    return members;
}

export async function addGroupMember(groupId: number, userId: number) {
    try {
        await query(
            'INSERT INTO speaker_group_members (group_id, user_id) VALUES (?, ?)',
            [groupId, userId]
        );
        revalidatePath(`/admin/speakers/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error('Add group member error:', error);
        return { error: 'Failed to add member' };
    }
}

export async function removeGroupMember(groupId: number, userId: number) {
    try {
        await query(
            'DELETE FROM speaker_group_members WHERE group_id = ? AND user_id = ?',
            [groupId, userId]
        );
        revalidatePath(`/admin/speakers/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error('Remove group member error:', error);
        return { error: 'Failed to remove member' };
    }
}

// Fetch all users with speaker role to be selected as speakers
export async function getSpeakers() {
    const users = await query('SELECT id, first_name, last_name, email, profile_image FROM users WHERE role = "speaker" ORDER BY first_name ASC') as any[];
    return users;
}

// --- Update Speaker Details ---

export async function updateSpeakerDetails(formData: FormData) {
    const userId = parseInt(formData.get('user_id') as string);
    const groupId = formData.get('group_id'); // For revalidation
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;
    const title = formData.get('title') as string;
    const organization = formData.get('organization') as string;
    const country = formData.get('country') as string;
    const imageFile = formData.get('profile_image') as File;
    const displayOrder = formData.get('display_order') ? parseInt(formData.get('display_order') as string) : 0;

    try {
        let imageUrl = null;

        // Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `speaker-${userId}-${Date.now()}-${imageFile.name}`;
            const path = join(process.cwd(), 'public/uploads', fileName);

            await writeFile(path, buffer);
            imageUrl = `/uploads/${fileName}`;
        }

        // Build Update Query
        let sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, bio = ?, title = ?, organization = ?, country = ?';
        const params: any[] = [firstName, lastName, email, bio, title || null, organization || null, country || null];

        if (imageUrl) {
            sql += ', profile_image = ?';
            params.push(imageUrl);
        }

        sql += ' WHERE id = ?';
        params.push(userId);

        await query(sql, params);

        // Update display order in the relationship table
        if (groupId) {
            await query(
                'UPDATE speaker_group_members SET display_order = ? WHERE group_id = ? AND user_id = ?',
                [displayOrder, groupId, userId]
            );
        }

        if (groupId) {
            revalidatePath(`/admin/speakers/${groupId}`);
        }
        return { success: true };
    } catch (error) {
        console.error('Update speaker details error:', error);
        return { error: 'Failed to update speaker details' };
    }
}

// --- Create New Speaker (User) ---

export async function createSpeakerUser(formData: FormData) {
    const groupId = parseInt(formData.get('group_id') as string);
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string; // Optional, default if empty
    const bio = formData.get('bio') as string;
    const title = formData.get('title') as string;
    const organization = formData.get('organization') as string;
    const country = formData.get('country') as string;
    const imageFile = formData.get('profile_image') as File;

    try {
        // 1. Check if email exists
        const existing = await query('SELECT id FROM users WHERE email = ?', [email]) as { id: number }[];
        if (existing.length > 0) {
            return { error: 'Email already exists' };
        }

        // 2. Hash Password
        const passwordToHash = password || 'Speaker123!'; // Default password
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);

        // 3. Handle Image Upload
        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `speaker-new-${Date.now()}-${imageFile.name}`;
            const path = join(process.cwd(), 'public/uploads', fileName);

            await writeFile(path, buffer);
            imageUrl = `/uploads/${fileName}`;
        }

        // 4. Create User with speaker role
        const result = await query(
            `INSERT INTO users (first_name, last_name, email, password_hash, role, bio, title, organization, country, profile_image) 
             VALUES (?, ?, ?, ?, 'speaker', ?, ?, ?, ?, ?)`,
            [firstName, lastName, email, hashedPassword, bio, title || null, organization || null, country || null, imageUrl]
        ) as any;

        const userId = result.insertId;

        // 5. Add to Group
        await addGroupMember(groupId, userId);

        revalidatePath(`/admin/speakers/${groupId}`);
        return { success: true };
    } catch (error) {
        console.error('Create speaker user error:', error);
        return { error: 'Failed to create speaker' };
    }
}

// --- General Speaker Management ---

export async function createSpeaker(formData: FormData) {
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const profile_image = formData.get('profile_image') as string || null;
    const bio = formData.get('bio') as string || null;

    try {
        // Check if email exists
        const existing = await query('SELECT id FROM users WHERE email = ?', [email]) as any[];
        if (existing.length > 0) {
            return { error: 'Email already exists' };
        }

        // Create user with speaker role and default password
        const hashedPassword = await bcrypt.hash('Speaker123!', 10);
        await query(
            `INSERT INTO users (first_name, last_name, email, password_hash, role, profile_image, bio) 
             VALUES (?, ?, ?, ?, 'speaker', ?, ?)`,
            [firstName, lastName, email, hashedPassword, profile_image, bio]
        );

        revalidatePath('/admin/speakers');
        return { success: true };
    } catch (error) {
        console.error('Create speaker error:', error);
        return { error: 'Failed to create speaker' };
    }
}

export async function updateSpeaker(formData: FormData) {
    const id = parseInt(formData.get('id') as string);
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const profile_image = formData.get('profile_image') as string || null;
    const bio = formData.get('bio') as string || null;

    try {
        await query(
            `UPDATE users SET first_name = ?, last_name = ?, email = ?, profile_image = ?, bio = ? 
             WHERE id = ?`,
            [firstName, lastName, email, profile_image, bio, id]
        );

        revalidatePath('/admin/speakers');
        return { success: true };
    } catch (error) {
        console.error('Update speaker error:', error);
        return { error: 'Failed to update speaker' };
    }
}

export async function deleteSpeaker(id: number) {
    try {
        await query('DELETE FROM users WHERE id = ? AND role = "speaker"', [id]);
        revalidatePath('/admin/speakers');
        return { success: true };
    } catch (error) {
        console.error('Delete speaker error:', error);
        return { error: 'Failed to delete speaker' };
    }
}
