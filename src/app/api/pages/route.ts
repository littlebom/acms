import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET - List all pages
export async function GET() {
    try {
        const pages = await query('SELECT * FROM pages ORDER BY updated_at DESC');
        return NextResponse.json(pages);
    } catch (error) {
        console.error('GET pages error:', error);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST - Create new page
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        const formData = await request.formData();

        const slug = formData.get('slug') as string;
        const title_en = formData.get('title_en') as string;
        const title_th = formData.get('title_th') as string || null;
        const content_en = formData.get('content_en') as string || null;
        const content_th = formData.get('content_th') as string || null;
        const template = formData.get('template') as string || 'default';
        const status = formData.get('status') as string || 'draft';

        const result = await query(
            `INSERT INTO pages (slug, title_en, title_th, content_en, content_th, template, status, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [slug, title_en, title_th, content_en, content_th, template, status, session?.userId || null]
        ) as any;

        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error: any) {
        console.error('POST page error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}
