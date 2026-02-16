'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VisualBuilder, getDefaultContent, Block } from "@/components/admin/visual-builder";
import { Loader2 } from 'lucide-react';

interface PageData {
    id: number;
    slug: string;
    title_en: string;
    content_en: string;
}

export default function HeaderEditorPage() {
    const router = useRouter();
    const [page, setPage] = useState<PageData | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch or Initialize Header Layout
    useEffect(() => {
        async function initHeader() {
            try {
                // 1. Try to fetch existing header
                // Note: We need an API that can find by slug. 
                // Since our current list API might not filter by slug easily, 
                // we'll try to implement a safer check.
                // Assuming we might need to create it if it doesn't exist.

                // Let's list all pages and find one with slug 'system-header'
                // This is not efficient for large DBs but fine for this scope.
                const res = await fetch('/api/pages');
                if (res.ok) {
                    const pages = await res.json();
                    const existingHeader = pages.find((p: any) => p.slug === 'system-header');

                    if (existingHeader) {
                        setPage(existingHeader);
                    } else {
                        // 2. Create if not exists
                        const formData = new FormData();
                        formData.append('slug', 'system-header');
                        formData.append('title_en', 'System Header');
                        formData.append('content_en', ''); // Empty initially, VisualBuilder will load default
                        formData.append('template', 'full-width');
                        formData.append('status', 'published');

                        const createRes = await fetch('/api/pages', {
                            method: 'POST',
                            body: formData,
                        });

                        if (createRes.ok) {
                            // Fetch created page to get ID
                            // (Assuming we can't get ID directly from POST easily without parsing)
                            // Let's just refresh list
                            const newRes = await fetch('/api/pages');
                            const newPages = await newRes.json();
                            setPage(newPages.find((p: any) => p.slug === 'system-header'));
                        }
                    }
                }
            } catch (error) {
                console.error('Error initializing system header:', error);
            } finally {
                setLoading(false);
            }
        }
        initHeader();
    }, []);

    const handleSave = async (html: string, css: string, title: string) => {
        if (!page) return;

        const formData = new FormData();
        formData.append('title_en', title);
        // Force wrap with specific structure if needed, or just save generic
        formData.append('content_en', `<style>${css}</style>${html}`);

        const response = await fetch(`/api/pages/${page.id}`, {
            method: 'PUT',
            body: formData,
        });

        if (response.ok) {
            alert('Header layout saved successfully!');
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
        return <div className="p-8 text-center text-red-500">Failed to load system header configuration.</div>;
    }

    const contentWithoutStyle = page.content_en?.replace(/<style>[\s\S]*?<\/style>/gi, '') || '';

    const defaultBlocks: Block[] = [{
        id: 'header-nav',
        type: 'navbar',
        content: getDefaultContent('navbar')
    }];

    return (
        <VisualBuilder
            initialContent={contentWithoutStyle}
            defaultBlocks={defaultBlocks}
            onSave={handleSave}
            title="Edit Header Layout"
            initialTitle="System Header"
            backUrl="/admin/website/layout"
        />
    );
}
