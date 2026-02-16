'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus } from "lucide-react";
import { assignReviewer } from "@/app/actions/paper-reviews";
import type { Reviewer } from "@/app/actions/paper-reviews";

interface AssignReviewerFormProps {
    paperId: number;
    reviewers: Reviewer[];
    paperTrackId?: number | null;
}

export function AssignReviewerForm({ paperId, reviewers, paperTrackId }: AssignReviewerFormProps) {
    const router = useRouter();
    const [selectedReviewer, setSelectedReviewer] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sort reviewers: Matching track first, then by name
    const sortedReviewers = [...reviewers].sort((a, b) => {
        const aMatch = paperTrackId && a.track_id === paperTrackId;
        const bMatch = paperTrackId && b.track_id === paperTrackId;

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return (a.first_name || '').localeCompare(b.first_name || '');
    });

    const handleAssign = async () => {
        if (!selectedReviewer) return;

        setLoading(true);
        setError(null);

        const result = await assignReviewer(paperId, parseInt(selectedReviewer));

        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSelectedReviewer('');
            router.refresh();
        }
    };

    return (
        <div className="pt-3 border-t mt-3">
            <p className="text-sm font-medium mb-2">Assign Reviewer</p>
            {error && (
                <p className="text-xs text-red-500 mb-2">{error}</p>
            )}
            <div className="flex gap-2">
                <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select reviewer..." />
                    </SelectTrigger>
                    <SelectContent>
                        {sortedReviewers.map(reviewer => {
                            const isRecommended = paperTrackId && reviewer.track_id === paperTrackId;
                            return (
                                <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                                    {reviewer.first_name} {reviewer.last_name}
                                    {isRecommended && (
                                        <span className="ml-2 text-emerald-600 font-medium text-xs">(Recommended)</span>
                                    )}
                                    {reviewer.track_name && !isRecommended && (
                                        <span className="ml-2 text-slate-400 text-xs">({reviewer.track_name})</span>
                                    )}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleAssign}
                    disabled={!selectedReviewer || loading}
                    size="sm"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}
