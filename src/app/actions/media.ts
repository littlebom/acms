'use server';

import { writeFile, readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';

const UPLOAD_DIR = 'uploads';
const PUBLIC_DIR = join(process.cwd(), 'public', UPLOAD_DIR);

export interface MediaFile {
    name: string;
    path: string;
    url: string;
    size: number;
    type: string;
    createdAt: Date;
}

export async function uploadFile(formData: FormData): Promise<{ success: boolean; error?: string; file?: MediaFile }> {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        // Sanitize filename: remove spaces, special chars
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}-${safeName}`;
        const filePath = join(PUBLIC_DIR, fileName);

        // Ensure directories exist (optional if we know it exists, but safe to check)
        // await mkdir(PUBLIC_DIR, { recursive: true }); 
        // Assuming public/uploads exists as checked

        await writeFile(filePath, buffer);

        revalidatePath('/admin/media');

        return {
            success: true,
            file: {
                name: fileName,
                path: filePath,
                url: `/${UPLOAD_DIR}/${fileName}`,
                size: file.size,
                type: file.type,
                createdAt: new Date()
            }
        };

    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: 'Failed to upload file' };
    }
}

export async function getMediaFiles(): Promise<MediaFile[]> {
    try {
        const fileNames = await readdir(PUBLIC_DIR);

        const files: MediaFile[] = [];

        for (const fileName of fileNames) {
            // Skip hidden files like .DS_Store
            if (fileName.startsWith('.')) continue;

            try {
                const filePath = join(PUBLIC_DIR, fileName);
                const fileStat = await stat(filePath);

                if (fileStat.isFile()) {
                    files.push({
                        name: fileName,
                        path: filePath,
                        url: `/${UPLOAD_DIR}/${fileName}`,
                        size: fileStat.size,
                        type: getFileType(fileName), // Simple extension check
                        createdAt: fileStat.birthtime
                    });
                }
            } catch (e) {
                console.warn(`Could not read file ${fileName}`, e);
            }
        }

        // Sort by newest first
        return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error) {
        console.error('Error reading media files:', error);
        return [];
    }
}

export async function deleteFile(fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
        const filePath = join(PUBLIC_DIR, fileName);
        await unlink(filePath);
        revalidatePath('/admin/media');
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: 'Failed to delete file' };
    }
}

// ===== Image Processing Functions =====

/**
 * Optimize image: compress and optionally convert to WebP
 */
export async function optimizeImage(
    inputPath: string,
    outputPath: string,
    options?: { quality?: number; format?: 'webp' | 'jpeg' | 'png' }
): Promise<{ success: boolean; error?: string }> {
    try {
        const { quality = 80, format = 'webp' } = options || {};

        await sharp(inputPath)
            .toFormat(format, { quality })
            .toFile(outputPath);

        return { success: true };
    } catch (error) {
        console.error('Optimize error:', error);
        return { success: false, error: 'Failed to optimize image' };
    }
}

/**
 * Resize image to specific dimensions
 */
export async function resizeImage(
    inputPath: string,
    outputPath: string,
    width: number,
    height?: number,
    options?: { fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' }
): Promise<{ success: boolean; error?: string }> {
    try {
        const { fit = 'cover' } = options || {};

        await sharp(inputPath)
            .resize(width, height, { fit })
            .toFile(outputPath);

        return { success: true };
    } catch (error) {
        console.error('Resize error:', error);
        return { success: false, error: 'Failed to resize image' };
    }
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
    inputPath: string,
    outputPath: string,
    size: number = 200
): Promise<{ success: boolean; error?: string }> {
    try {
        await sharp(inputPath)
            .resize(size, size, { fit: 'cover' })
            .toFormat('webp', { quality: 80 })
            .toFile(outputPath);

        return { success: true };
    } catch (error) {
        console.error('Thumbnail error:', error);
        return { success: false, error: 'Failed to create thumbnail' };
    }
}

/**
 * Process uploaded image: optimize and create thumbnail
 */
export async function processUploadedImage(
    originalPath: string,
    fileName: string
): Promise<{ optimized?: string; thumbnail?: string }> {
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const optimizedPath = join(PUBLIC_DIR, `${nameWithoutExt}_optimized.webp`);
    const thumbnailPath = join(PUBLIC_DIR, `${nameWithoutExt}_thumb.webp`);

    const results: { optimized?: string; thumbnail?: string } = {};

    // Create optimized version
    const optimizeResult = await optimizeImage(originalPath, optimizedPath, { quality: 85 });
    if (optimizeResult.success) {
        results.optimized = `/${UPLOAD_DIR}/${nameWithoutExt}_optimized.webp`;
    }

    // Create thumbnail
    const thumbResult = await createThumbnail(originalPath, thumbnailPath, 200);
    if (thumbResult.success) {
        results.thumbnail = `/${UPLOAD_DIR}/${nameWithoutExt}_thumb.webp`;
    }

    return results;
}

function getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (ext && imageExts.includes(ext)) return 'image';
    return 'file';
}
