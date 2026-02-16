'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText, Clock, CheckCircle2, XCircle, Eye, Edit3
} from "lucide-react";
import type { ReviewerAssignment } from "@/app/actions/paper-reviews";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending Response', color: 'bg-amber-100 text-amber-700', icon: Clock },
    accepted: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Edit3 },
    declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    expired: { label: 'Expired', color: 'bg-slate-100 text-slate-700', icon: Clock },
};

interface AssignmentsListProps {
    assignments: (ReviewerAssignment & { paper_status?: string })[];
    reviewerId: number;
}

export function AssignmentsList({ assignments, reviewerId }: AssignmentsListProps) {
    if (assignments.length === 0) {
        return (
            <Card className="text-center py-16">
                <CardContent>
                    <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Assignments Yet</h3>
                    <p className="text-slate-500">
                        You don't have any papers assigned for review.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {assignments.map((assignment) => {
                const statusConfig = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;

                return (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Status Badge */}
                                    <Badge className={`${statusConfig.color} mb-3`}>
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusConfig.label}
                                    </Badge>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                                        {assignment.paper_title}
                                    </h3>

                                    {/* Dates */}
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                        <span>
                                            Assigned: {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                                        </span>
                                        {assignment.due_date && (
                                            <span className="text-amber-600 font-medium">
                                                Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                        {assignment.completed_at && (
                                            <span className="text-emerald-600">
                                                Completed: {format(new Date(assignment.completed_at), 'MMM d, yyyy')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    {assignment.status === 'pending' && (
                                        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                                            <Link href={`/reviewer/assignments/${assignment.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                View & Respond
                                            </Link>
                                        </Button>
                                    )}

                                    {assignment.status === 'accepted' && (
                                        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                            <Link href={`/reviewer/assignments/${assignment.id}/review`}>
                                                <Edit3 className="h-4 w-4 mr-1" />
                                                Submit Review
                                            </Link>
                                        </Button>
                                    )}

                                    {assignment.status === 'completed' && (
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/reviewer/assignments/${assignment.id}`}>
                                                <Eye className="h-4 w-4 mr-1" />
                                                View Review
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
