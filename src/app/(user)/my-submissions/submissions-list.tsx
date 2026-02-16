'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Edit3,
    Eye,
    AlertCircle,
    Send
} from "lucide-react";
import type { Paper, PaperStatus } from "@/app/actions/papers";

const STATUS_CONFIG: Record<PaperStatus, { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: Edit3 },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Send },
    under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-700', icon: Clock },
    revision_required: { label: 'Revision Required', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    revision_submitted: { label: 'Revision Submitted', color: 'bg-indigo-100 text-indigo-700', icon: Send },
    accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    camera_ready: { label: 'Camera Ready', color: 'bg-teal-100 text-teal-700', icon: FileText },
    published: { label: 'Published', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

export function MySubmissionsList({ papers }: { papers: Paper[] }) {
    if (papers.length === 0) {
        return (
            <Card className="text-center py-16">
                <CardContent>
                    <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Submissions Yet</h3>
                    <p className="text-slate-500 mb-6">
                        You haven't submitted any papers yet. Start by submitting your first paper.
                    </p>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/submit-paper">Submit Your First Paper</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {papers.map((paper) => {
                const statusConfig = STATUS_CONFIG[paper.status];
                const StatusIcon = statusConfig.icon;

                return (
                    <Card key={paper.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Status Badge */}
                                    <Badge className={`${statusConfig.color} mb-3`}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusConfig.label}
                                    </Badge>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-2">
                                        {paper.title}
                                    </h3>

                                    {/* Track */}
                                    {paper.track_name && (
                                        <p className="text-sm text-slate-500 mb-2">
                                            Track: <span className="font-medium">{paper.track_name}</span>
                                        </p>
                                    )}

                                    {/* Abstract Preview */}
                                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                        {paper.abstract}
                                    </p>

                                    {/* Dates */}
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                        <span>
                                            Created: {format(new Date(paper.created_at), 'MMM d, yyyy')}
                                        </span>
                                        {paper.submitted_at && (
                                            <span>
                                                Submitted: {format(new Date(paper.submitted_at), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                        {paper.decision_at && (
                                            <span>
                                                Decision: {format(new Date(paper.decision_at), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/my-submissions/${paper.id}`}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            View Details
                                        </Link>
                                    </Button>

                                    {paper.status === 'draft' && (
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/my-submissions/${paper.id}/edit`}>
                                                <Edit3 className="h-4 w-4 mr-1" />
                                                Edit
                                            </Link>
                                        </Button>
                                    )}

                                    {paper.status === 'revision_required' && (
                                        <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
                                            <Link href={`/my-submissions/${paper.id}/revise`}>
                                                <Send className="h-4 w-4 mr-1" />
                                                Submit Revision
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
