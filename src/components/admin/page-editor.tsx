'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Eye, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { createPage, updatePage, type Page } from "@/app/actions/website";

interface PageEditorProps {
    page?: Page | null;
}

export function PageEditor({ page }: PageEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('en');

    // Form state
    const [slug, setSlug] = useState(page?.slug || '');
    const [titleEn, setTitleEn] = useState(page?.title_en || '');
    const [titleTh, setTitleTh] = useState(page?.title_th || '');
    const [contentEn, setContentEn] = useState(page?.content_en || '');
    const [contentTh, setContentTh] = useState(page?.content_th || '');
    const [excerptEn, setExcerptEn] = useState(page?.excerpt_en || '');
    const [excerptTh, setExcerptTh] = useState(page?.excerpt_th || '');
    const [metaTitle, setMetaTitle] = useState(page?.meta_title || '');
    const [metaDescription, setMetaDescription] = useState(page?.meta_description || '');
    const [template, setTemplate] = useState(page?.template || 'default');
    const [status, setStatus] = useState(page?.status || 'draft');
    const [featuredImage, setFeaturedImage] = useState(page?.featured_image || '');

    // Auto-generate slug from title
    useEffect(() => {
        if (!page && titleEn) {
            const generatedSlug = titleEn
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setSlug(generatedSlug);
        }
    }, [titleEn, page]);

    async function handleSubmit(saveStatus: 'draft' | 'published' = 'draft') {
        setLoading(true);

        const formData = new FormData();
        formData.append('slug', slug);
        formData.append('title_en', titleEn);
        formData.append('title_th', titleTh);
        formData.append('content_en', contentEn);
        formData.append('content_th', contentTh);
        formData.append('excerpt_en', excerptEn);
        formData.append('excerpt_th', excerptTh);
        formData.append('meta_title', metaTitle || titleEn);
        formData.append('meta_description', metaDescription || excerptEn);
        formData.append('template', template);
        formData.append('status', saveStatus);
        formData.append('featured_image', featuredImage);

        try {
            let result;
            if (page) {
                result = await updatePage(page.id, formData);
            } else {
                result = await createPage(formData);
            }

            if (result.success) {
                router.push('/admin/website/pages');
                router.refresh();
            } else {
                alert(result.error || 'Failed to save page');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/website/pages">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {page ? 'Edit Page' : 'Create New Page'}
                        </h1>
                        {page && (
                            <p className="text-sm text-muted-foreground">
                                Last updated: {new Date(page.updated_at).toLocaleString('th-TH')}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    {page?.status === 'published' && (
                        <Link href={`/${page.slug}`} target="_blank">
                            <Button variant="outline">
                                <Eye className="mr-2 h-4 w-4" />
                                View Page
                            </Button>
                        </Link>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => handleSubmit('draft')}
                        disabled={loading || !titleEn || !slug}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                    </Button>
                    <Button
                        onClick={() => handleSubmit('published')}
                        disabled={loading || !titleEn || !slug}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Globe className="mr-2 h-4 w-4" />
                        Publish
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Language Tabs */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Content</CardTitle>
                            <CardDescription>
                                Create content in multiple languages
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="mb-4">
                                    <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
                                    <TabsTrigger value="th">🇹🇭 ไทย</TabsTrigger>
                                </TabsList>

                                <TabsContent value="en" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title_en">Title (English) *</Label>
                                        <Input
                                            id="title_en"
                                            value={titleEn}
                                            onChange={(e) => setTitleEn(e.target.value)}
                                            placeholder="Page title in English"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content (English)</Label>
                                        <TiptapEditor
                                            variant="simple"
                                            content={contentEn}
                                            onChange={setContentEn}
                                            placeholder="Write your content here..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="excerpt_en">Excerpt (English)</Label>
                                        <Textarea
                                            id="excerpt_en"
                                            value={excerptEn}
                                            onChange={(e) => setExcerptEn(e.target.value)}
                                            placeholder="Brief summary for previews..."
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="th" className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title_th">Title (ภาษาไทย)</Label>
                                        <Input
                                            id="title_th"
                                            value={titleTh}
                                            onChange={(e) => setTitleTh(e.target.value)}
                                            placeholder="ชื่อหน้าเว็บภาษาไทย"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content (ภาษาไทย)</Label>
                                        <TiptapEditor
                                            variant="simple"
                                            content={contentTh}
                                            onChange={setContentTh}
                                            placeholder="เขียนเนื้อหาที่นี่..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="excerpt_th">Excerpt (ภาษาไทย)</Label>
                                        <Textarea
                                            id="excerpt_th"
                                            value={excerptTh}
                                            onChange={(e) => setExcerptTh(e.target.value)}
                                            placeholder="สรุปสั้นๆ สำหรับแสดงตัวอย่าง..."
                                            rows={3}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Page Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Page Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug *</Label>
                                <div className="flex items-center">
                                    <span className="text-sm text-muted-foreground mr-1">/</span>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="page-url"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="template">Template</Label>
                                <Select value={template} onValueChange={(val) => setTemplate(val as any)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default</SelectItem>
                                        <SelectItem value="full-width">Full Width</SelectItem>
                                        <SelectItem value="sidebar">With Sidebar</SelectItem>
                                        <SelectItem value="landing">Landing Page</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="featured_image">Featured Image URL</Label>
                                <Input
                                    id="featured_image"
                                    value={featuredImage}
                                    onChange={(e) => setFeaturedImage(e.target.value)}
                                    placeholder="https://..."
                                />
                                {featuredImage && (
                                    <img
                                        src={featuredImage}
                                        alt="Featured"
                                        className="w-full h-32 object-cover rounded-lg mt-2"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input
                                    id="meta_title"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder={titleEn || 'SEO title...'}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {metaTitle.length}/60 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder="Brief description for search engines..."
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {metaDescription.length}/160 characters
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
