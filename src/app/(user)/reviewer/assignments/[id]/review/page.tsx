import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getReviewerByUserId } from "@/app/actions/paper-reviews";
import { getPaper, getPaperFiles } from "@/app/actions/papers";
import { query } from "@/lib/db";
import { ReviewForm } from "./review-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Info } from "lucide-react";

async function getAssignment(assignmentId: number, reviewerId: number) {
    const result = await query(`
        SELECT ra.*, p.title, p.abstract, p.keywords, pt.name as track_name
        FROM reviewer_assignments ra
        JOIN papers p ON ra.paper_id = p.id
        LEFT JOIN paper_tracks pt ON p.track_id = pt.id
        WHERE ra.id = ? AND ra.reviewer_id = ?
    `, [assignmentId, reviewerId]) as any[];
    return result.length > 0 ? result[0] : null;
}

async function getExistingReview(assignmentId: number) {
    const result = await query(`
        SELECT * FROM paper_reviews WHERE assignment_id = ?
    `, [assignmentId]) as any[];
    return result.length > 0 ? result[0] : null;
}

export default async function ReviewerReviewPage({ params }: { params: { id: string } }) {
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

    const assignment = await getAssignment(assignmentId, reviewer.id);
    if (!assignment) {
        notFound();
    }

    // Check if assignment is accepted
    if (assignment.status !== 'accepted' && assignment.status !== 'completed') {
        redirect('/reviewer/assignments');
    }

    const [files, existingReview] = await Promise.all([
        getPaperFiles(assignment.paper_id),
        getExistingReview(assignmentId)
    ]);

    // Filter files to show only blind versions or original
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

            {/* Header */}
            <div className="mb-8">
                <Badge className="mb-3 bg-purple-100 text-purple-700">
                    {assignment.track_name || 'General'}
                </Badge>
                <h1 className="text-2xl font-bold text-slate-900 mb-4">{assignment.title}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Review Form */}
                <div className="lg:col-span-2">
                    <ReviewForm
                        assignmentId={assignmentId}
                        paperId={assignment.paper_id}
                        existingReview={existingReview}
                        isCompleted={assignment.status === 'completed'}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Paper Abstract */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Abstract</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-[12]">
                                {assignment.abstract}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Keywords */}
                    {assignment.keywords && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Keywords</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {assignment.keywords.split(',').map((kw: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                            {kw.trim()}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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

                    {/* Review Guidelines */}
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <Info className="h-5 w-5" />
                                Review Guidelines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-blue-700 space-y-2">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Rate each criterion from 1 (Poor) to 5 (Excellent)</li>
                                <li>Provide constructive feedback</li>
                                <li>Comments to Editor are confidential</li>
                                <li>Be objective and fair</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
