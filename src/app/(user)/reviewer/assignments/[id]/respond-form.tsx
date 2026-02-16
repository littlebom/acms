'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { respondToAssignment } from "@/app/actions/paper-reviews";

interface RespondFormProps {
    assignmentId: number;
}

export function RespondForm({ assignmentId }: RespondFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showDeclineReason, setShowDeclineReason] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleRespond = async (accept: boolean) => {
        setLoading(true);
        setError(null);

        const result = await respondToAssignment(
            assignmentId,
            accept,
            accept ? undefined : declineReason
        );

        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            router.refresh();
            if (accept) {
                router.push(`/reviewer/assignments/${assignmentId}/review`);
            } else {
                router.push('/reviewer/assignments');
            }
        }
    };

    return (
        <Card className="border-2 border-blue-200">
            <CardHeader>
                <CardTitle>Respond to Assignment</CardTitle>
                <CardDescription>
                    Please accept or decline this review assignment
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {showDeclineReason ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Reason for Declining (optional)</Label>
                            <Textarea
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="e.g., Conflict of interest, Not my area of expertise, No time available..."
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeclineReason(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleRespond(false)}
                                disabled={loading}
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                                Confirm Decline
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => handleRespond(true)}
                            disabled={loading}
                            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                            )}
                            Accept Assignment
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeclineReason(true)}
                            disabled={loading}
                            className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50"
                        >
                            <XCircle className="h-5 w-5 mr-2" />
                            Decline
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
