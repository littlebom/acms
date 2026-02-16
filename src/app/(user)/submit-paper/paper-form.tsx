'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, Upload, FileText, Users, Info } from "lucide-react";
import { createPaper } from "@/app/actions/papers";
import type { PaperTrack } from "@/app/actions/paper-tracks";

interface CoAuthor {
    first_name: string;
    last_name: string;
    email: string;
    institution: string;
}

interface PaperSubmissionFormProps {
    tracks: PaperTrack[];
    eventId?: number;
    userId: number;
}

export function PaperSubmissionForm({ tracks, eventId, userId }: PaperSubmissionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [coAuthors, setCoAuthors] = useState<CoAuthor[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const addCoAuthor = () => {
        setCoAuthors([...coAuthors, { first_name: '', last_name: '', email: '', institution: '' }]);
    };

    const removeCoAuthor = (index: number) => {
        setCoAuthors(coAuthors.filter((_, i) => i !== index));
    };

    const updateCoAuthor = (index: number, field: keyof CoAuthor, value: string) => {
        const updated = [...coAuthors];
        updated[index][field] = value;
        setCoAuthors(updated);
    };

    const handleSubmit = async (formData: FormData, isDraft: boolean = false) => {
        setLoading(true);
        setError(null);

        // Add co-authors as JSON
        formData.set('co_authors', JSON.stringify(coAuthors));
        formData.set('save_draft', isDraft ? 'true' : 'false');
        if (eventId) {
            formData.set('event_id', eventId.toString());
        }

        const result = await createPaper(formData);
        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            router.push('/my-submissions');
        }
    };

    return (
        <form action={(formData) => handleSubmit(formData, false)}>
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Paper Information */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Paper Information
                    </CardTitle>
                    <CardDescription>
                        Provide details about your research paper
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Track Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="track_id">Track / Category <span className="text-red-500">*</span></Label>
                        <Select name="track_id" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a track" />
                            </SelectTrigger>
                            <SelectContent>
                                {tracks.map(track => (
                                    <SelectItem key={track.id} value={track.id.toString()}>
                                        {track.name}
                                        {track.name_th && <span className="text-slate-500 ml-2">({track.name_th})</span>}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title (English) <span className="text-red-500">*</span></Label>
                            <Input id="title" name="title" required placeholder="Enter paper title" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title_th">Title (Thai)</Label>
                            <Input id="title_th" name="title_th" placeholder="ชื่อบทความภาษาไทย" />
                        </div>
                    </div>

                    {/* Abstract */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="abstract">Abstract (English) <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="abstract"
                                name="abstract"
                                required
                                rows={6}
                                placeholder="Enter your abstract (250-500 words)"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="abstract_th">Abstract (Thai)</Label>
                            <Textarea
                                id="abstract_th"
                                name="abstract_th"
                                rows={6}
                                placeholder="บทคัดย่อภาษาไทย"
                            />
                        </div>
                    </div>

                    {/* Keywords */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="keywords">Keywords (English)</Label>
                            <Input
                                id="keywords"
                                name="keywords"
                                placeholder="e.g., machine learning, deep learning, AI"
                            />
                            <p className="text-xs text-slate-500">Separate keywords with commas</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keywords_th">Keywords (Thai)</Label>
                            <Input
                                id="keywords_th"
                                name="keywords_th"
                                placeholder="เช่น การเรียนรู้ของเครื่อง, ปัญญาประดิษฐ์"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Co-Authors */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Co-Authors
                            </CardTitle>
                            <CardDescription>
                                Add additional authors (you are already listed as the first author)
                            </CardDescription>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addCoAuthor}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Co-Author
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {coAuthors.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Users className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                            <p>No co-authors added yet</p>
                            <p className="text-sm">Click "Add Co-Author" to include additional authors</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {coAuthors.map((author, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-slate-50 relative">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                        onClick={() => removeCoAuthor(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <Label>First Name</Label>
                                            <Input
                                                value={author.first_name}
                                                onChange={(e) => updateCoAuthor(index, 'first_name', e.target.value)}
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div>
                                            <Label>Last Name</Label>
                                            <Input
                                                value={author.last_name}
                                                onChange={(e) => updateCoAuthor(index, 'last_name', e.target.value)}
                                                placeholder="Last name"
                                            />
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={author.email}
                                                onChange={(e) => updateCoAuthor(index, 'email', e.target.value)}
                                                placeholder="Email"
                                            />
                                        </div>
                                        <div>
                                            <Label>Institution</Label>
                                            <Input
                                                value={author.institution}
                                                onChange={(e) => updateCoAuthor(index, 'institution', e.target.value)}
                                                placeholder="University/Organization"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Paper File
                    </CardTitle>
                    <CardDescription>
                        Upload your paper in PDF or Word format (Max 10MB)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <Input
                            id="file"
                            name="file"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="file" className="cursor-pointer">
                            {selectedFile ? (
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                    <FileText className="h-8 w-8" />
                                    <div>
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 mx-auto text-slate-400 mb-2" />
                                    <p className="text-slate-600 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-sm text-slate-500">PDF, DOC, DOCX (Max 10MB)</p>
                                </>
                            )}
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Guidelines */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Info className="h-5 w-5" />
                        Submission Guidelines
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700 space-y-2">
                    <ul className="list-disc list-inside space-y-1">
                        <li>Papers must be original and not previously published</li>
                        <li>Abstract should be between 250-500 words</li>
                        <li>Use the official paper template (available on the conference website)</li>
                        <li>Ensure all authors' information is accurate</li>
                        <li>Double-blind review: Remove author information from the paper file</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                        const form = document.querySelector('form') as HTMLFormElement;
                        const formData = new FormData(form);
                        handleSubmit(formData, true);
                    }}
                >
                    Save as Draft
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Paper
                </Button>
            </div>
        </form>
    );
}
