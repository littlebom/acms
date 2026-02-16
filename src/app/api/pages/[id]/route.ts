import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get single page
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const pages = await query('SELECT * FROM pages WHERE id = ?', [id]) as any[];

        if (pages.length === 0) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json(pages[0]);
    } catch (error) {
        console.error('GET page error:', error);
        return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }
}

// PUT - Update page
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const formData = await request.formData();

        // Get existing page
        const pages = await query('SELECT * FROM pages WHERE id = ?', [id]) as any[];
        if (pages.length === 0) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const existingPage = pages[0];

        // Update fields
        const slug = formData.get('slug') as string || existingPage.slug;
        const title_en = formData.get('title_en') as string || existingPage.title_en;
        const title_th = formData.get('title_th') as string ?? existingPage.title_th;
        const content_en = formData.get('content_en') as string ?? existingPage.content_en;
        const content_th = formData.get('content_th') as string ?? existingPage.content_th;
        const template = formData.get('template') as string || existingPage.template;
        const status = formData.get('status') as string || existingPage.status;

        await query(
            `UPDATE pages SET slug = ?, title_en = ?, title_th = ?, content_en = ?, content_th = ?, template = ?, status = ?
             WHERE id = ?`,
            [slug, title_en, title_th, content_en, content_th, template, status, id]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('PUT page error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE - Delete page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        await query('DELETE FROM pages WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE page error:', error);
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
