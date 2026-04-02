'use server';

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { emailExists } from '@/lib/user-utils';

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: 'admin' | 'chair' | 'reviewer' | 'author' | 'attendee' | 'speaker';
    profile_image: string | null;
    bio?: string;
    created_at: Date;
    // Extended profile fields
    title?: string;
    gender?: string;
    birth_year?: number;
    phone_number?: string;
    address?: string;
    education_level?: string;
    occupation?: string;
    institution?: string;
    country?: string;
}

export async function getUsers() {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        // Optionally restrict full list to admins, though UserList component is likely admin-only
        // return [];
    }
    const users = await query('SELECT * FROM users ORDER BY created_at DESC') as User[];
    return users;
}

export async function deleteUser(id: number) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        await query('DELETE FROM users WHERE id = ?', [id]);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Delete user error:', error);
        return { error: 'Failed to delete user' };
    }
}

export async function updateUserRole(id: number, role: string) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    try {
        await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        revalidatePath('/admin/users');
        revalidatePath(`/dashboard/profile/${id}`);
        revalidatePath(`/profile/${id}`);
        return { success: true };
    } catch (error) {
        console.error('Update user role error:', error);
        return { error: 'Failed to update user role' };
    }
}

export async function updateUserDetails(formData: FormData) {
    const session = await getSession();
    if (!session) {
        return { error: 'Unauthorized' };
    }

    const userId = parseInt(formData.get('user_id') as string);
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const bio = formData.get('bio') as string;

    // Extended fields
    const title = formData.get('title') as string;
    const gender = formData.get('gender') as string;
    const birthYear = formData.get('birth_year') ? parseInt(formData.get('birth_year') as string) : null;
    const phoneNumber = formData.get('phone_number') as string;
    const address = formData.get('address') as string;
    const educationLevel = formData.get('education_level') as string;
    const occupation = formData.get('occupation') as string;
    const institution = formData.get('institution') as string;
    const country = formData.get('country') as string;

    const imageFile = formData.get('profile_image') as File;

    const currentUserId = Number(session.userId);
    const isAdmin = session.role === 'admin';

    // Verify permission: User can update themselves, Admin can update anyone
    if (userId !== currentUserId && !isAdmin) {
        return { error: 'Unauthorized to update this profile' };
    }

    try {
        let imageUrl = null;

        // Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `user-${userId}-${Date.now()}-${imageFile.name}`;
            const uploadDir = join(process.cwd(), 'public/uploads');

            await mkdir(uploadDir, { recursive: true });

            const path = join(uploadDir, fileName);

            await writeFile(path, buffer);
            imageUrl = `/uploads/${fileName}`;
        }

        // Build Update Query
        let sql = `UPDATE users SET 
            first_name = ?, last_name = ?, email = ?, bio = ?,
            title = ?, gender = ?, birth_year = ?, phone_number = ?, address = ?,
            education_level = ?, occupation = ?, institution = ?, country = ?
        `;
        const params: any[] = [
            firstName, lastName, email, bio,
            title, gender, birthYear, phoneNumber, address,
            educationLevel, occupation, institution, country
        ];

        if (imageUrl) {
            sql += ', profile_image = ?';
            params.push(imageUrl);
        }

        sql += ' WHERE id = ?';
        params.push(userId);

        await query(sql, params);

        revalidatePath('/admin/users');
        revalidatePath(`/dashboard/profile/${userId}`);
        revalidatePath(`/profile/${userId}`);

        return { success: true };
    } catch (error) {
        console.error('Update user details error:', error);
        return { error: 'Failed to update user details' };
    }
}

export async function createUser(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return { error: 'Unauthorized' };
    }

    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const bio = formData.get('bio') as string;

    // Extended fields
    const title = formData.get('title') as string;
    const gender = formData.get('gender') as string;
    const birthYear = formData.get('birth_year') ? parseInt(formData.get('birth_year') as string) : null;
    const phoneNumber = formData.get('phone_number') as string;
    const address = formData.get('address') as string;
    const educationLevel = formData.get('education_level') as string;
    const occupation = formData.get('occupation') as string;
    const institution = formData.get('institution') as string;
    const country = formData.get('country') as string;

    const imageFile = formData.get('profile_image') as File;

    try {
        // 1. Check if email exists
        const existingUserId = await emailExists(email);
        if (existingUserId !== null) {
            return { error: 'Email already exists' };
        }

        // 2. Hash Password
        const passwordToHash = password || 'User123!'; // Default password if empty
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);

        // 3. Create User record first to get the ID for image naming
        const result = await query(
            `INSERT INTO users (
                first_name, last_name, email, password_hash, role, bio,
                title, gender, birth_year, phone_number, address,
                education_level, occupation, institution, country
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                firstName, lastName, email, hashedPassword, role, bio,
                title, gender, birthYear, phoneNumber, address,
                educationLevel, occupation, institution, country
            ]
        ) as any;

        const userId = result.insertId;

        // 4. Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `user-${userId}-${Date.now()}-${imageFile.name}`;
            const uploadDir = join(process.cwd(), 'public/uploads');

            await mkdir(uploadDir, { recursive: true });

            const path = join(uploadDir, fileName);
            await writeFile(path, buffer);
            const imageUrl = `/uploads/${fileName}`;

            // Update user with image URL
            await query('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, userId]);
        }

        revalidatePath('/admin/users');
        return { success: true, userId };
    } catch (error) {
        console.error('Create user error:', error);
        return { error: 'Failed to create user' };
    }
}
