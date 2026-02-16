'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { VisualBuilder } from "@/components/admin/visual-builder";
import { Loader2 } from 'lucide-react';

interface PageData {
    id: number;
    slug: string;
    title_en: string;
    content_en: string;
}

export default function EditBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPage() {
            try {
                const res = await fetch(`/api/pages/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setPage(data);
                }
            } catch (error) {
                console.error('Error fetching page:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPage();
    }, [params.id]);

    const handleSave = async (html: string, css: string, title: string) => {
        if (!page) return;

        const formData = new FormData();
        formData.append('title_en', title);
        formData.append('content_en', `<style>${css}</style>${html}`);

        const response = await fetch(`/api/pages/${page.id}`, {
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            alert('Page saved successfully!');
            router.refresh(); // Refresh to update title if displayed elsewhere
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (!page) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
                Page not found
            </div>
        );
    }

    // Extract content without style tags for editor
    const contentWithoutStyle = page.content_en?.replace(/<style>[\s\S]*?<\/style>/gi, '') || '';

    return (
        <VisualBuilder
            initialContent={contentWithoutStyle}
            onSave={handleSave}
            title={`Edit: ${page.title_en}`}
            initialTitle={page.title_en}
            backUrl="/admin/website/pages"
        />
    );
}
