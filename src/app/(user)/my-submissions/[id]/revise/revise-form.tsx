'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, AlertCircle, ArrowLeft } from "lucide-react";
import { uploadRevision } from "@/app/actions/papers";
import type { Paper } from "@/app/actions/papers";
import Link from 'next/link';

export function ReviseForm({ paper }: { paper: Paper }) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('paper_id', paper.id.toString());
        formData.append('file', file);

        try {
            const result = await uploadRevision(formData);
            if (result.error) {
                setError(result.error);
            } else {
                router.push(`/my-submissions/${paper.id}`);
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-2xl py-10 space-y-6">
            <Link href={`/my-submissions/${paper.id}`} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" /> Back to Paper Details
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>Submit Revision</CardTitle>
                    <CardDescription>
                        Upload the revised version of your manuscript (PDF only).
                        <br />
                        Paper: <strong>{paper.title}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="file">Revision File (PDF)</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-slate-500">
                                Please ensure you have addressed all reviewer comments in this version.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link href={`/my-submissions/${paper.id}`}>
                                <Button variant="outline" type="button" disabled={loading}>Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={loading || !file} className="bg-emerald-600 hover:bg-emerald-700">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Submit Revision
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
