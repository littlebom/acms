'use client';

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TiptapEditor } from "../tiptap-editor";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createNews, updateNews, type NewsItem } from "@/app/actions/news";
import { uploadImage } from "@/app/actions/upload";
import { Loader2, ArrowLeft, Save, Upload, ImageIcon, X } from "lucide-react";
import Link from "next/link";

interface NewsFormProps {
    initialData?: NewsItem;
    isEditing?: boolean;
}

export function NewsForm({ initialData, isEditing = false }: NewsFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.image_url || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        content: initialData?.content || "",
        image_url: initialData?.image_url || "",
        is_published: initialData?.is_published || false,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl("");
        setSelectedFile(null);
        setFormData(prev => ({ ...prev, image_url: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let finalImageUrl = formData.image_url;

            // Upload new image if selected
            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('file', selectedFile);
                const result = await uploadImage(uploadData);
                if (result.success && result.url) {
                    finalImageUrl = result.url;
                } else {
                    console.error("Upload failed:", result.error);
                    // Decide if we should stop or continue without image
                    // For now, let's continue but maybe alert (or just log)
                }
            }

            const dataToSave = {
                ...formData,
                image_url: finalImageUrl
            };

            if (isEditing && initialData) {
                await updateNews(initialData.id, dataToSave);
            } else {
                await createNews(dataToSave);
            }
            router.push('/admin/engagement/news');
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" asChild>
                    <Link href="/admin/engagement/news" className="gap-2 text-slate-500">
                        <ArrowLeft className="h-4 w-4" /> Back to News
                    </Link>
                </Button>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-4">
                    <CardTitle className="text-xl font-bold text-slate-900">
                        {isEditing ? `Edit News: ${formData.title}` : "Create News"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">

                    {/* Image Upload (Top) */}
                    <div className="space-y-3">
                        <Label>Cover Image</Label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            {previewUrl ? (
                                <div className="relative rounded-lg overflow-hidden shadow-sm inline-block">
                                    <img src={previewUrl} alt="Preview" className="max-w-full h-auto max-h-[200px] object-contain" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-6" onClick={() => fileInputRef.current?.click()}>
                                    <div className="bg-white p-2.5 rounded-full shadow-sm inline-flex mb-2">
                                        <ImageIcon className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="text-sm font-medium text-slate-900">Click to upload cover image</div>
                                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 2MB)</p>
                                    <Button type="button" variant="outline" size="sm" className="mt-3 h-8 text-xs" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="h-3 w-3 mr-2" />
                                        Select File
                                    </Button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter news headline..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="text-lg font-medium"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <div className="min-h-[400px]">
                            <TiptapEditor
                                content={formData.content}
                                onChange={(html: string) => setFormData({ ...formData, content: html })}
                                placeholder="Write your article content here..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50">
                        <div className="space-y-0.5">
                            <Label className="text-base">Publish Status</Label>
                            <p className="text-sm text-slate-500">
                                Make this news article visible to the public immediately.
                            </p>
                        </div>
                        <Switch
                            checked={formData.is_published}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t border-slate-50 py-4 flex justify-end gap-2">

                    <Button variant="outline" asChild>
                        <Link href="/admin/engagement/news">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                {isEditing ? "Update News" : "Create News"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
