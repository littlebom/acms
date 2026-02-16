'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/auth';

interface User {
    id: number;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    role: string;
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    try {
        // Find user by email
        const users = await query(
            'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = ?',
            [email]
        ) as User[];

        if (!users || users.length === 0) {
            return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
        }

        const user = users[0];

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
        }

        // Create session
        await createSession(user.id, user.email, user.role);

        // Redirect based on role
        if (user.role === 'admin') {
            redirect('/admin');
        } else {
            redirect('/dashboard');
        }
    } catch (error) {
        // Handle redirect (Next.js throws NEXT_REDIRECT)
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error('Login error:', error);
        return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' };
    }
}

export async function register(formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // New Fields
    const title = formData.get('title') as string;
    const gender = formData.get('gender') as string;
    const birthYear = formData.get('birthYear') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const address = formData.get('address') as string;
    const educationLevel = formData.get('educationLevel') as string;
    const occupation = formData.get('occupation') as string;
    const institution = formData.get('institution') as string;
    const country = formData.get('country') as string;
    const imageFile = formData.get('profileImage') as File;

    if (!firstName || !lastName || !email || !password) {
        return { error: 'กรุณากรอกข้อมูลสำคัญให้ครบ (First Name, Last Name, Email, Password)' };
    }

    if (password.length < 6) {
        return { error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' };
    }

    try {
        // Check if user exists
        const existing = await query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        ) as any[];

        if (existing && existing.length > 0) {
            return { error: 'อีเมลนี้ถูกใช้งานแล้ว' };
        }

        // Handle Image Upload
        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            // Use a temporary ID placeholder or timestamp for filename since we don't have ID yet
            const fileName = `register-${Date.now()}-${imageFile.name}`;

            // Ensure uploads directory exists
            const { mkdir, writeFile } = await import('fs/promises');
            const { join } = await import('path');
            const uploadDir = join(process.cwd(), 'public/uploads');
            await mkdir(uploadDir, { recursive: true });

            const path = join(uploadDir, fileName);
            await writeFile(path, buffer);
            imageUrl = `/uploads/${fileName}`;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await query(
            `INSERT INTO users (
                email, password_hash, first_name, last_name, role, 
                title, gender, birth_year, phone_number, address, 
                education_level, occupation, institution, country, profile_image
            ) VALUES (?, ?, ?, ?, 'attendee', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                email, hashedPassword, firstName, lastName,
                title || null,
                gender || null,
                birthYear || null,
                phoneNumber || null,
                address || null,
                educationLevel || null,
                occupation || null,
                institution || null,
                country || null,
                imageUrl
            ]
        ) as any;

        // Create session for new user
        await createSession(result.insertId, email, 'attendee');

        redirect('/dashboard');
    } catch (error) {
        // Handle redirect
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        console.error('Register error:', error);
        return { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' };
    }
}

export async function logout() {
    await deleteSession();
    redirect('/login');
}
