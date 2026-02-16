'use client';

import { VisualBuilder } from "@/components/admin/visual-builder";
import { useRouter } from "next/navigation";

export default function NewBuilderPage() {
    const router = useRouter();

    const handleSave = async (html: string, css: string, title: string) => {
        // Save as new page
        const formData = new FormData();
        formData.append('slug', `page-${Date.now()}`);
        formData.append('title_en', title);
        formData.append('content_en', `<style>${css}</style>${html}`);
        formData.append('template', 'full-width');
        formData.append('status', 'draft');

        const response = await fetch('/api/pages', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            router.push('/admin/website/pages');
        }
    };

    return (
        <VisualBuilder
            onSave={handleSave}
            title="Create New Page"
            initialTitle="New Page"
            backUrl="/admin/website/pages"
        />
    );
}
