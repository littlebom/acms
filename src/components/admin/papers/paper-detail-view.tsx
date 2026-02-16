'use client';

import { useState, useEffect } from 'react';
import { format } from "date-fns";
import {
    FileText, CheckCircle2, Users, FileEdit, Gavel, Globe,
    Download, AlertCircle, Clock, XCircle, UserPlus, MessageSquare,
    ChevronRight, Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import type { Paper, PaperAuthor, PaperFile } from "@/app/actions/papers";
import type { ReviewerAssignment, PaperReview, Reviewer } from "@/app/actions/paper-reviews";
import { AssignReviewerForm } from "@/app/(admin)/admin/papers/[id]/assign-reviewer-form";
import { PaperDecisionForm } from "@/app/(admin)/admin/papers/[id]/paper-decision-form";
import { updatePaperStatus } from "@/app/actions/papers";

interface PaperDetailViewProps {
    paper: Paper;
    authors: PaperAuthor[];
    files: PaperFile[];
    assignments: ReviewerAssignment[];
    reviews: PaperReview[];
    reviewers: Reviewer[];
}

const STAGES = [
    { id: 'submission', label: 'Submission', icon: FileText, description: 'Initial Manuscript' },
    { id: 'screening', label: 'Screening', icon: CheckCircle2, description: 'Editor Check' },
    { id: 'review', label: 'Peer Review', icon: Users, description: 'Evaluation' },
    { id: 'revision', label: 'Revision', icon: FileEdit, description: 'Corrections' },
    { id: 'decision', label: 'Decision', icon: Gavel, description: 'Final Verdict' },
    { id: 'publication', label: 'Publication', icon: Globe, description: 'Production' },
];

export function PaperDetailView({
    paper, authors, files, assignments, reviews, reviewers
}: PaperDetailViewProps) {
    const [activeTab, setActiveTab] = useState('submission');
    const [isLoading, setIsLoading] = useState(false);

    // Filter available reviewers
    const assignedReviewerIds = assignments.map(a => a.reviewer_id);
    const availableReviewers = reviewers.filter(r => !assignedReviewerIds.includes(r.id));

    // Determine default tab based on status
    useEffect(() => {
        const getTabFromStatus = (status: string) => {
            switch (status) {
                case 'draft': return 'submission';
                case 'submitted': return 'screening';
                case 'under_review': return 'review';
                case 'revision_required':
                case 'revision_submitted': return 'revision';
                case 'accepted':
                case 'rejected': return 'decision';
                case 'camera_ready':
                case 'published': return 'publication';
                default: return 'submission';
            }
        };
        setActiveTab(getTabFromStatus(paper.status));
    }, [paper.status]);

    const handleQuickAction = async (action: string) => {
        if (!confirm('Are you sure you want to proceed with this action?')) return;
        setIsLoading(true);
        try {
            if (action === 'pass_to_review') {
                await updatePaperStatus(paper.id, 'under_review', 'Passed screening check');
            } else if (action === 'desk_reject') {
                await updatePaperStatus(paper.id, 'rejected', 'Desk Rejected during screening');
            } else if (action === 'publish') {
                await updatePaperStatus(paper.id, 'published');
            }
            // Router refresh handled by server action usually, but we might need explicit
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Action failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to check if a stage is "passed"
    const isStageComplete = (stageId: string) => {
        const status = paper.status;
        const passedStages = {
            'submission': ['submitted', 'under_review', 'revision_required', 'revision_submitted', 'accepted', 'rejected', 'camera_ready', 'published'],
            'screening': ['under_review', 'revision_required', 'revision_submitted', 'accepted', 'rejected', 'camera_ready', 'published'],
            'review': ['revision_required', 'revision_submitted', 'accepted', 'rejected', 'camera_ready', 'published'],
            'revision': ['accepted', 'rejected', 'camera_ready', 'published'],
            'decision': ['camera_ready', 'published'],
            'publication': ['published']
        };
        return passedStages[stageId as keyof typeof passedStages]?.includes(status);
    };

    return (
        <div className="space-y-6">
            {/* Stage Progress Stepper */}
            <div className="bg-white p-4 rounded-lg border shadow-sm overflow-x-auto">
                <div className="flex items-center min-w-[800px]">
                    {STAGES.map((stage, index) => {
                        const isCurrent = activeTab === stage.id;
                        const isComplete = isStageComplete(stage.id);
                        const Icon = stage.icon;

                        return (
                            <div key={stage.id} className="flex-1 flex items-center">
                                <div
                                    className={`
                                        flex flex-col items-center gap-2 cursor-pointer relative z-10 p-2 rounded-lg transition-colors
                                        ${isCurrent ? 'bg-blue-50 text-blue-700 font-medium' : ''}
                                        ${isComplete ? 'text-emerald-600' : 'text-slate-500'}
                                    `}
                                    onClick={() => setActiveTab(stage.id)}
                                >
                                    <div className={`
                                        h-10 w-10 rounded-full flex items-center justify-center border-2
                                        ${isCurrent ? 'border-blue-500 bg-white' : ''}
                                        ${isComplete ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50'}
                                    `}>
                                        {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm px-2 text-nowrap">{stage.label}</div>
                                        <div className="text-[10px] text-slate-400 hidden lg:block">{stage.description}</div>
                                    </div>
                                </div>
                                {index < STAGES.length - 1 && (
                                    <div className={`flex-1 h-[2px] mx-2 ${isStageComplete(stage.id) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">

                {/* 1. Submission Tab */}
                <TabsContent value="submission" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manuscript Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-500 mb-1">Abstract</h3>
                                        <p className="text-slate-700 bg-slate-50 p-4 rounded-md text-sm leading-relaxed">{paper.abstract}</p>
                                    </div>
                                    {paper.keywords && (
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-500 mb-2">Keywords</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {paper.keywords.split(',').map((kw, i) => (
                                                    <Badge key={i} variant="secondary">{kw.trim()}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Users className="h-4 w-4" /> Authors
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {authors.map((author, index) => (
                                        <div key={author.id} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-medium">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {author.first_name} {author.last_name}
                                                    {author.is_corresponding && <span className="text-blue-500 ml-1">*</span>}
                                                </div>
                                                <div className="text-xs text-slate-500">{author.email}</div>
                                                <div className="text-xs text-slate-400">{author.institution}</div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> Files
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {files.filter(f => f.version_type === 'original').map((file) => (
                                            <a key={file.id} href={file.file_path} target="_blank" className="flex items-center p-2 rounded border hover:bg-slate-50 transition-colors">
                                                <FileText className="h-8 w-8 text-blue-500 mr-3" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{file.file_name}</div>
                                                    <div className="text-xs text-slate-400">{format(new Date(file.uploaded_at), 'MMM d, HH:mm')} • {(file.file_size ? (file.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown')}</div>
                                                </div>
                                                <Download className="h-4 w-4 text-slate-400" />
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* 2. Screening Tab */}
                <TabsContent value="screening" className="mt-0 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Initial Screening</CardTitle>
                            <CardDescription>Review the manuscript for compliance and scope before sending to peer review.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-amber-800">Reviewer Check</h4>
                                        <ul className="list-disc list-inside text-sm text-amber-700 mt-1 space-y-1">
                                            <li>Is the topic within the conference scope?</li>
                                            <li>Is the formatting correct?</li>
                                            <li>Is the abstract clear?</li>
                                            <li>Are all authors listed correctly?</li>
                                        </ul>
                                    </div>
                                </div>

                                {paper.status === 'submitted' && (
                                    <div className="flex gap-3 mt-4">
                                        <Button
                                            onClick={() => handleQuickAction('pass_to_review')}
                                            disabled={isLoading}
                                            className="bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Pass to Review
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleQuickAction('desk_reject')}
                                            disabled={isLoading}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Desk Reject
                                        </Button>
                                    </div>
                                )}
                                {paper.status !== 'submitted' && paper.status !== 'draft' && (
                                    <div className="text-sm text-slate-500 mt-2">
                                        This paper has passed the screening stage.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. Peer Review Tab */}
                <TabsContent value="review" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Reviews List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5" />
                                            Reviews Received ({reviews.length})
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={async () => {
                                                if (!confirm('This will assign you as a reviewer for this paper. Continue?')) return;
                                                // Import via required or dynamic - implementing inline logic to call server action
                                                setIsLoading(true);
                                                try {
                                                    const { assignSelfAsReviewer } = await import('@/app/actions/paper-reviews');
                                                    const res = await assignSelfAsReviewer(paper.id);
                                                    if (res.success && res.assignmentId) {
                                                        window.location.href = `/reviewer/assignments/${res.assignmentId}`;
                                                    } else {
                                                        alert(res.error || 'Failed to assign self');
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                    alert('Error processing request');
                                                } finally {
                                                    setIsLoading(false);
                                                }
                                            }}
                                        >
                                            <Gavel className="h-4 w-4 mr-2" />
                                            Review as Admin
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {reviews.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
                                            No reviews submitted yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {reviews.map((review) => (
                                                <div key={review.id} className="p-4 border rounded-lg bg-slate-50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-medium flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                                                                {review.reviewer_name?.[0]}
                                                            </div>
                                                            {review.reviewer_name}
                                                        </span>
                                                        <Badge variant={review.recommendation === 'reject' ? 'destructive' : 'outline'}>
                                                            {review.recommendation?.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-5 gap-2 mb-3 text-sm bg-white p-2 rounded border">
                                                        <div className="text-center"><div className="text-[10px] text-slate-400">Originality</div><div className="font-bold">{review.score_originality}</div></div>
                                                        <div className="text-center"><div className="text-[10px] text-slate-400">Method</div><div className="font-bold">{review.score_methodology}</div></div>
                                                        <div className="text-center"><div className="text-[10px] text-slate-400">Present</div><div className="font-bold">{review.score_presentation}</div></div>
                                                        <div className="text-center"><div className="text-[10px] text-slate-400">Relevance</div><div className="font-bold">{review.score_relevance}</div></div>
                                                        <div className="text-center border-l"><div className="text-[10px] text-slate-400">Overall</div><div className="font-bold text-blue-600">{review.score_overall}</div></div>
                                                    </div>
                                                    {review.comments_to_author && (
                                                        <div className="mt-2 text-sm">
                                                            <span className="font-medium text-slate-700">Comments to Author:</span>
                                                            <p className="text-slate-600 mt-1">{review.comments_to_author}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            {/* Assigned Reviewers */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Users className="h-4 w-4" /> Assigned Reviewers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {assignments.map((assignment) => (
                                        <div key={assignment.id} className="flex items-center justify-between p-2 rounded bg-slate-50 border">
                                            <div>
                                                <div className="text-sm font-medium">{assignment.reviewer_name}</div>
                                                <div className="text-xs text-slate-500">
                                                    Assigned: {format(new Date(assignment.assigned_at), 'MMM d')}
                                                </div>
                                            </div>
                                            <Badge variant={
                                                assignment.status === 'completed' ? 'default' :
                                                    assignment.status === 'declined' ? 'destructive' : 'secondary'
                                            } className="text-[10px]">
                                                {assignment.status}
                                            </Badge>
                                        </div>
                                    ))}

                                    {/* Assign New */}
                                    {availableReviewers.length > 0 && (
                                        <div className="pt-2">
                                            <AssignReviewerForm
                                                paperId={paper.id}
                                                reviewers={availableReviewers}
                                                paperTrackId={paper.track_id}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Navigation to Decision */}
                    {reviews.length > 0 && (
                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                onClick={() => setActiveTab('decision')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Proceed to Decision <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* 4. Revision Tab */}
                <TabsContent value="revision" className="mt-0 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revision History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {files.filter(f => f.version_type === 'revision').length === 0 ? (
                                    <div className="text-center py-6 text-slate-500">
                                        No revisions uploaded yet.
                                    </div>
                                ) : (
                                    files.filter(f => f.version_type === 'revision').map((file) => (
                                        <div key={file.id} className="flex items-center p-3 rounded-lg border bg-amber-50/50">
                                            <div className="h-10 w-10 rounded bg-amber-100 flex items-center justify-center text-amber-600 font-bold mr-3">
                                                v{file.version_number}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{file.file_name}</div>
                                                <div className="text-xs text-slate-500">
                                                    Uploaded {format(new Date(file.uploaded_at), 'MMM d, yyyy HH:mm')}
                                                </div>
                                            </div>
                                            <a href={file.file_path} target="_blank" className="p-2 hover:bg-amber-100 rounded">
                                                <Download className="h-4 w-4 text-amber-600" />
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Navigation to Decision */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            onClick={() => setActiveTab('decision')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Proceed to Decision <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </TabsContent>

                {/* 5. Decision Tab */}
                <TabsContent value="decision" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            {/* Paper Decision Form */}
                            <PaperDecisionForm paperId={paper.id} currentStatus={paper.status} />

                            {/* Decision History/Status */}
                            {(paper.decision_at) && (
                                <div className="mt-6 p-4 rounded-lg bg-slate-50 border">
                                    <h3 className="font-medium mb-2">Decision Record</h3>
                                    <div className="flex gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500">Status:</span>
                                            <Badge className="ml-2">{paper.status}</Badge>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Date:</span>
                                            <span className="ml-2 font-medium">{format(new Date(paper.decision_at), 'PPP pp')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <Card>
                                <CardHeader><CardTitle className="text-sm">Review Summary</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-center p-4">
                                        <div className="text-3xl font-bold text-slate-800">
                                            {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.score_overall || 0), 0) / reviews.length).toFixed(1) : '-'}
                                        </div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Avg Score</div>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="space-y-2 mt-4">
                                        {['strong_accept', 'accept', 'minor_revision', 'major_revision', 'reject'].map(rec => {
                                            const count = reviews.filter(r => r.recommendation === rec).length;
                                            if (count === 0) return null;
                                            return (
                                                <div key={rec} className="flex justify-between text-sm">
                                                    <span className="text-slate-600 capitalize">{rec.replace(/_/g, ' ')}</span>
                                                    <span className="font-medium bg-slate-100 px-2 rounded">{count}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Navigation to Publication */}
                    {paper.status === 'accepted' && (
                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                onClick={() => setActiveTab('publication')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Proceed to Publication <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* 6. Publication Tab */}
                <TabsContent value="publication" className="mt-0 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Publication & Production</CardTitle>
                            <CardDescription>Final check and publishing.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium">Camera Ready Files</h3>
                                {files.filter(f => f.version_type === 'camera_ready').length === 0 ? (
                                    <div className="text-sm text-slate-500 italic">No camera-ready files submitted yet.</div>
                                ) : (
                                    files.filter(f => f.version_type === 'camera_ready').map((file) => (
                                        <div key={file.id} className="flex items-center p-3 rounded-lg border bg-teal-50/50 border-teal-100">
                                            <FileText className="h-5 w-5 text-teal-600 mr-3" />
                                            <div className="flex-1">
                                                <div className="font-medium text-sm text-teal-900">{file.file_name}</div>
                                                <div className="text-xs text-teal-600">
                                                    Uploaded {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                                                </div>
                                            </div>
                                            <a href={file.file_path} target="_blank" className="p-2 hover:bg-teal-100 rounded">
                                                <Download className="h-4 w-4 text-teal-600" />
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-sm font-medium mb-4">Publishing Action</h3>
                                <div className="bg-slate-50 p-4 rounded border flex items-center justify-between">
                                    <div className="text-sm">
                                        <div className="font-medium">Publish Paper</div>
                                        <div className="text-slate-500">Make this paper visible to the public in the proceedings.</div>
                                    </div>
                                    <Button
                                        onClick={() => handleQuickAction('publish')}
                                        disabled={paper.status === 'published' || isLoading}
                                        className={paper.status === 'published' ? "bg-green-600 hover:bg-green-700" : ""}
                                    >
                                        {paper.status === 'published' ? (
                                            <><CheckCircle2 className="h-4 w-4 mr-2" /> Published</>
                                        ) : (
                                            <><Globe className="h-4 w-4 mr-2" /> Publish Now</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}

