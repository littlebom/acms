import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getReviewerByUserId, respondToAssignment } from "@/app/actions/paper-reviews";
import { getPaperFiles } from "@/app/actions/papers";
import { query } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText, Download, CheckCircle2, XCircle, Clock } from "lucide-react";
import { RespondForm } from "./respond-form";

async function getAssignmentWithPaper(assignmentId: number, reviewerId: number) {
    const result = await query(`
        SELECT ra.*, p.title, p.abstract, p.keywords, pt.name as track_name
        FROM reviewer_assignments ra
        JOIN papers p ON ra.paper_id = p.id
        LEFT JOIN paper_tracks pt ON p.track_id = pt.id
        WHERE ra.id = ? AND ra.reviewer_id = ?
    `, [assignmentId, reviewerId]) as any[];
    return result.length > 0 ? result[0] : null;
}

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const reviewer = await getReviewerByUserId(session.userId);
    if (!reviewer) {
        redirect('/reviewer/assignments');
    }

    const resolvedParams = await Promise.resolve(params);
    const assignmentId = parseInt(resolvedParams.id);

    if (isNaN(assignmentId)) {
        notFound();
    }

    const assignment = await getAssignmentWithPaper(assignmentId, reviewer.id);
    if (!assignment) {
        notFound();
    }

    const files = await getPaperFiles(assignment.paper_id);
    const reviewableFiles = files.filter(f => f.version_type === 'blind' || f.version_type === 'original');

    return (
        <div className="container mx-auto max-w-4xl py-8">
            {/* Back Button */}
            <div className="mb-6">
                <Link href="/reviewer/assignments" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Assignments
                </Link>
            </div>

            {/* Status Banner */}
            {assignment.status === 'pending' && (
                <Card className="mb-6 border-amber-200 bg-amber-50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="h-6 w-6 text-amber-600" />
                            <div>
                                <p className="font-medium text-amber-800">Pending Your Response</p>
                                <p className="text-sm text-amber-700">Please accept or decline this review assignment</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {assignment.status === 'accepted' && (
                <Card className="mb-6 border-blue-200 bg-blue-50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-6 w-6 text-blue-600" />
                            <div>
                                <p className="font-medium text-blue-800">You Accepted This Assignment</p>
                                <p className="text-sm text-blue-700">Please submit your review</p>
                            </div>
                        </div>
                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                            <Link href={`/reviewer/assignments/${assignmentId}/review`}>
                                Submit Review
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {assignment.status === 'completed' && (
                <Card className="mb-6 border-emerald-200 bg-emerald-50">
                    <CardContent className="p-4 flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        <div>
                            <p className="font-medium text-emerald-800">Review Completed</p>
                            <p className="text-sm text-emerald-700">Thank you for your review!</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Header */}
            <div className="mb-8">
                <Badge className="mb-3 bg-purple-100 text-purple-700">
                    {assignment.track_name || 'General'}
                </Badge>
                <h1 className="text-2xl font-bold text-slate-900 mb-4">{assignment.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Abstract */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Abstract</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 whitespace-pre-wrap">{assignment.abstract}</p>
                        </CardContent>
                    </Card>

                    {/* Keywords */}
                    {assignment.keywords && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Keywords</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {assignment.keywords.split(',').map((kw: string, i: number) => (
                                        <Badge key={i} variant="secondary">{kw.trim()}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Respond Form (if pending) */}
                    {assignment.status === 'pending' && (
                        <RespondForm assignmentId={assignmentId} />
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Files */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Paper Files
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {reviewableFiles.length === 0 ? (
                                <p className="text-sm text-slate-500">No files available</p>
                            ) : (
                                <div className="space-y-2">
                                    {reviewableFiles.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.file_path}
                                            target="_blank"
                                            className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 group"
                                        >
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate group-hover:text-blue-600">
                                                    {file.file_name}
                                                </p>
                                            </div>
                                            <Download className="h-4 w-4 text-slate-300" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
