'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';

const UPLOAD_DIR = 'uploads';
const PUBLIC_DIR = join(process.cwd(), 'public', UPLOAD_DIR);

/**
 * Upload a cropped image from base64 data
 */
export async function uploadCroppedImage(
    base64Data: string,
    originalFileName?: string
): Promise<{ success: boolean; error?: string; url?: string }> {
    try {
        // Remove data URL prefix if present and detect extension
        const mimeMatch = base64Data.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const extension = mimeType === 'image/png' ? 'png' : 'jpg';

        const base64String = base64Data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64String, 'base64');

        // Create unique filename with correct extension
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileName = `cropped-${timestamp}-${randomStr}.${extension}`;
        const filePath = join(PUBLIC_DIR, fileName);

        // Write file
        await writeFile(filePath, buffer);

        revalidatePath('/admin/system/media');
        revalidatePath('/admin/conference/tickets');

        return {
            success: true,
            url: `/${UPLOAD_DIR}/${fileName}`
        };
    } catch (error) {
        console.error('Upload cropped image error:', error);
        return {
            success: false,
            error: 'Failed to upload cropped image'
        };
    }
}

