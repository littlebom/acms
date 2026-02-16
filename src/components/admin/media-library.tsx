'use client';

import { useState, useRef, useEffect } from 'react';
import { uploadFile, deleteFile, type MediaFile } from '@/app/actions/media';
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, Check, Copy, Image as ImageIcon, File } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from 'next/image';

interface MediaLibraryProps {
    initialFiles?: MediaFile[];
    onSelect?: (file: MediaFile) => void;
    enableSelection?: boolean; // If true, selection visual cues are active
}

export function MediaLibrary({ initialFiles = [], onSelect, enableSelection = false }: MediaLibraryProps) {
    const [files, setFiles] = useState<MediaFile[]>(initialFiles);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Refresh files if initialFiles updates (e.g. from parent/server revalidation)
    useEffect(() => {
        setFiles(initialFiles);
    }, [initialFiles]);

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        await handleUpload(file);
    }

    async function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    async function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            await handleUpload(file);
        }
    }

    async function handleUpload(file: File) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadFile(formData);

        if (result.success && result.file) {
            setFiles(prev => [result.file!, ...prev]);
        } else {
            alert('Upload failed: ' + result.error);
        }
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleDelete(fileName: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this file?')) return;

        const result = await deleteFile(fileName);
        if (result.success) {
            setFiles(prev => prev.filter(f => f.name !== fileName));
            if (selectedFile?.name === fileName) setSelectedFile(null);
        } else {
            alert('Delete failed: ' + result.error);
        }
    }

    function handleCardClick(file: MediaFile) {
        setSelectedFile(file);
        if (onSelect) {
            onSelect(file);
        }
    }

    function copyToClipboard(text: string, e: React.MouseEvent) {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        alert('URL copied to clipboard!');
    }

    function formatSize(bytes: number) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                    isUploading ? "bg-slate-50 border-blue-300" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
                )}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf"
                />

                {isUploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
                        <p className="text-sm font-medium text-slate-600">Uploading...</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                            <Upload className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700">Click to upload or drag and drop</h3>
                        <p className="text-sm text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 10MB)</p>
                    </>
                )}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file) => (
                    <Card
                        key={file.name}
                        className={cn(
                            "group cursor-pointer overflow-hidden transition-all hover:shadow-md relative",
                            selectedFile?.name === file.name && enableSelection ? "ring-2 ring-blue-500 shadow-lg" : "border-slate-200"
                        )}
                        onClick={() => handleCardClick(file)}
                    >
                        {/* Aspect Ratio Box */}
                        <div className="aspect-square bg-slate-100 relative flex items-center justify-center overflow-hidden">
                            {file.type === 'image' ? (
                                <Image
                                    src={file.url}
                                    alt={file.name}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                />
                            ) : (
                                <File className="h-12 w-12 text-slate-400" />
                            )}

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                                    onClick={(e) => copyToClipboard(file.url, e)}
                                    title="Copy URL"
                                >
                                    <Copy className="h-4 w-4 text-slate-700" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8 rounded-full"
                                    onClick={(e) => handleDelete(file.name, e)}
                                    title="Delete File"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Selection Indicator */}
                            {selectedFile?.name === file.name && enableSelection && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-sm z-10">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </div>

                        <CardContent className="p-3">
                            <p className="text-sm font-medium text-slate-700 truncate" title={file.name}>
                                {file.name.split('-').slice(1).join('-') || file.name}
                                {/* Simple name trimming if using timestamp prefix */}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-slate-400 uppercase font-semibold">{file.type === 'image' ? file.name.split('.').pop() : 'FILE'}</span>
                                <span className="text-[10px] text-slate-400">{formatSize(file.size)}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {files.length === 0 && !isUploading && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        No media files found
                    </div>
                )}
            </div>
        </div>
    );
}
