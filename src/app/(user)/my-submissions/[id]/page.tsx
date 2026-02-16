import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPaper, getPaperAuthors, getPaperFiles } from "@/app/actions/papers";
import { getReviewsForPaper } from "@/app/actions/paper-reviews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import {
    FileText, Download, Users, MessageSquare, ArrowLeft,
    CheckCircle2, Clock, AlertCircle, XCircle, Edit3, Send
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
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

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const resolvedParams = await Promise.resolve(params);
    const paperId = parseInt(resolvedParams.id);

    if (isNaN(paperId)) {
        notFound();
    }

    const paper = await getPaper(paperId);

    if (!paper || paper.submitter_id !== session.userId) {
        notFound();
    }

    const [authors, files, reviews] = await Promise.all([
        getPaperAuthors(paperId),
        getPaperFiles(paperId),
        getReviewsForPaper(paperId)
    ]);

    const statusConfig = STATUS_CONFIG[paper.status] || STATUS_CONFIG.draft;
    const StatusIcon = statusConfig.icon;

    // Filter reviews to show only comments (blind review)
    const visibleReviews = reviews.filter(r => r.submitted_at && r.comments_to_author);

    return (
        <div className="container mx-auto max-w-4xl py-8">
            {/* Back Button */}
            <div className="mb-6">
                <Link href="/my-submissions" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to My Submissions
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
                <Badge className={`${statusConfig.color} mb-3`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                </Badge>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{paper.title}</h1>
                {paper.title_th && (
                    <p className="text-lg text-slate-600">{paper.title_th}</p>
                )}
                <p className="text-sm text-slate-500 mt-2">
                    Track: <span className="font-medium">{paper.track_name || 'Not specified'}</span>
                </p>
            </div>

            {/* Action Buttons */}
            {(paper.status === 'draft' || paper.status === 'revision_required') && (
                <div className="mb-6 flex gap-3">
                    {paper.status === 'draft' && (
                        <>
                            <Button asChild variant="outline">
                                <Link href={`/my-submissions/${paper.id}/edit`}>
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit Paper
                                </Link>
                            </Button>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                <Link href={`/my-submissions/${paper.id}/submit`}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Submit for Review
                                </Link>
                            </Button>
                        </>
                    )}
                    {paper.status === 'revision_required' && (
                        <Button asChild className="bg-amber-600 hover:bg-amber-700">
                            <Link href={`/my-submissions/${paper.id}/revise`}>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Revision
                            </Link>
                        </Button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Abstract */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Abstract</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 whitespace-pre-wrap">{paper.abstract}</p>
                            {paper.abstract_th && (
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="font-semibold text-slate-600 mb-2">บทคัดย่อ (Thai)</h4>
                                    <p className="text-slate-700 whitespace-pre-wrap">{paper.abstract_th}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Keywords */}
                    {paper.keywords && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Keywords</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {paper.keywords.split(',').map((kw, i) => (
                                        <Badge key={i} variant="secondary">{kw.trim()}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reviews (Blind - only comments) */}
                    {visibleReviews.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Reviewer Feedback
                                </CardTitle>
                                <CardDescription>
                                    Feedback from reviewers (anonymous)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {visibleReviews.map((review, index) => (
                                    <div key={review.id} className="p-4 bg-slate-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-slate-700">Reviewer {index + 1}</span>
                                            {review.recommendation && (
                                                <Badge variant="outline">
                                                    {review.recommendation.replace('_', ' ')}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-slate-600 whitespace-pre-wrap">{review.comments_to_author}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Authors */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Authors
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {authors.map((author, index) => (
                                    <div key={author.id} className="flex items-start gap-2">
                                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center font-medium">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-medium text-sm">
                                                {author.first_name} {author.last_name}
                                                {author.is_corresponding && (
                                                    <span className="text-xs text-blue-600 ml-1">*</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-slate-500">{author.email}</p>
                                            {author.institution && (
                                                <p className="text-xs text-slate-400">{author.institution}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 mt-3">* Corresponding Author</p>
                        </CardContent>
                    </Card>

                    {/* Files */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Files
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {files.length === 0 ? (
                                <p className="text-sm text-slate-500">No files uploaded</p>
                            ) : (
                                <div className="space-y-2">
                                    {files.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 group"
                                        >
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate group-hover:text-blue-600">
                                                    {file.file_name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {file.version_type} v{file.version_number}
                                                </p>
                                            </div>
                                            <Download className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Created</span>
                                    <span>{format(new Date(paper.created_at), 'MMM d, yyyy')}</span>
                                </div>
                                {paper.submitted_at && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Submitted</span>
                                        <span>{format(new Date(paper.submitted_at), 'MMM d, yyyy')}</span>
                                    </div>
                                )}
                                {paper.decision_at && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Decision</span>
                                        <span>{format(new Date(paper.decision_at), 'MMM d, yyyy')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
