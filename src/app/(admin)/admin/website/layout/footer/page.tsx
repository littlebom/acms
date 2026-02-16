'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VisualBuilder } from "@/components/admin/visual-builder";
import { Loader2 } from 'lucide-react';

interface PageData {
    id: number;
    slug: string;
    title_en: string;
    content_en: string;
}

export default function FooterEditorPage() {
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initFooter() {
            try {
                const res = await fetch('/api/pages');
                if (res.ok) {
                    const pages = await res.json();
                    const existingFooter = pages.find((p: any) => p.slug === 'system-footer');

                    if (existingFooter) {
                        setPage(existingFooter);
                    } else {
                        const formData = new FormData();
                        formData.append('slug', 'system-footer');
                        formData.append('title_en', 'System Footer');
                        formData.append('content_en', '');
                        formData.append('template', 'full-width');
                        formData.append('status', 'published');

                        const createRes = await fetch('/api/pages', {
                            method: 'POST',
                            body: formData,
                        });

                        if (createRes.ok) {
                            const newRes = await fetch('/api/pages');
                            const newPages = await newRes.json();
                            setPage(newPages.find((p: any) => p.slug === 'system-footer'));
                        }
                    }
                }
            } catch (error) {
                console.error('Error initializing system footer:', error);
            } finally {
                setLoading(false);
            }
        }
        initFooter();
    }, []);

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
            alert('Footer layout saved successfully!');
            router.refresh();
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
        return <div className="p-8 text-center text-red-500">Failed to load system footer configuration.</div>;
    }

    const contentWithoutStyle = page.content_en?.replace(/<style>[\s\S]*?<\/style>/gi, '') || '';

    return (
        <VisualBuilder
            initialContent={contentWithoutStyle}
            onSave={handleSave}
            title="Edit Footer Layout"
            initialTitle="System Footer"
            backUrl="/admin/website/layout"
        />
    );
}
