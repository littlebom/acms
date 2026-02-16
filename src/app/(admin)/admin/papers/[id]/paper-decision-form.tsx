'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { updatePaperStatus } from "@/app/actions/papers";
import type { PaperStatus } from "@/app/actions/papers";

interface PaperDecisionFormProps {
    paperId: number;
    currentStatus: string;
}

export function PaperDecisionForm({ paperId, currentStatus }: PaperDecisionFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState('');

    const handleDecision = async (decision: PaperStatus) => {
        setLoading(true);
        setError(null);

        const result = await updatePaperStatus(paperId, decision, comments);

        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            router.refresh();
        }
    };

    return (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
                <CardTitle>Make Decision</CardTitle>
                <CardDescription>
                    Based on the reviews, make a decision on this paper
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
                )}

                <div>
                    <label className="text-sm font-medium mb-1 block">
                        Comments to Author (optional)
                    </label>
                    <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Enter any additional comments for the author..."
                        rows={3}
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => handleDecision('accepted')}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                        )}
                        Accept
                    </Button>

                    <Button
                        onClick={() => handleDecision('revision_required')}
                        disabled={loading}
                        variant="outline"
                        className="border-amber-400 text-amber-700 hover:bg-amber-50"
                    >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Request Revision
                    </Button>

                    <Button
                        onClick={() => handleDecision('rejected')}
                        disabled={loading}
                        variant="outline"
                        className="border-red-400 text-red-700 hover:bg-red-50"
                    >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
