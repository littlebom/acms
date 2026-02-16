'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

const UPLOAD_DIR = 'uploads';
const PUBLIC_DIR = join(process.cwd(), 'public', UPLOAD_DIR);

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        await mkdir(PUBLIC_DIR, { recursive: true });

        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, ''); // Sanitize
        const fileName = `${timestamp}-${originalName}`;
        const filePath = join(PUBLIC_DIR, fileName);

        // Write file
        await writeFile(filePath, buffer);

        // Revalidate potential media pages (optional)
        revalidatePath('/admin/system/media');

        return {
            success: true,
            url: `/${UPLOAD_DIR}/${fileName}`
        };
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Failed to upload image' };
    }
}
