import { notFound } from "next/navigation";
import Link from "next/link";
import { getPaper, getPaperAuthors, getPaperFiles } from "@/app/actions/papers";
import { getAssignmentsForPaper, getReviewsForPaper, getReviewers } from "@/app/actions/paper-reviews";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { AdminPageContainer } from "@/components/admin/admin-page-header";
import { PaperDetailView } from "@/components/admin/papers/paper-detail-view";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-700' },
    revision_required: { label: 'Revision Required', color: 'bg-amber-100 text-amber-700' },
    revision_submitted: { label: 'Revision Submitted', color: 'bg-indigo-100 text-indigo-700' },
    accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
    camera_ready: { label: 'Camera Ready', color: 'bg-teal-100 text-teal-700' },
    published: { label: 'Published', color: 'bg-green-100 text-green-700' },
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function AdminPaperDetailPage({ params }: Props) {
    const { id: idStr } = await params;
    const paperId = parseInt(idStr);

    if (isNaN(paperId)) {
        notFound();
    }

    const paper = await getPaper(paperId);
    if (!paper) {
        notFound();
    }

    const [authors, files, assignments, reviews, reviewers] = await Promise.all([
        getPaperAuthors(paperId),
        getPaperFiles(paperId),
        getAssignmentsForPaper(paperId),
        getReviewsForPaper(paperId),
        getReviewers(true)
    ]);

    const statusConfig = STATUS_CONFIG[paper.status] || STATUS_CONFIG.draft;

    return (
        <AdminPageContainer>
            {/* Back Button */}
            <div className="mb-4">
                <Link href="/admin/papers" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Papers
                </Link>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        <span className="text-sm text-slate-500">Paper #{paper.id}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">{paper.title}</h1>
                    {paper.title_th && (
                        <p className="text-lg text-slate-600 mt-1">{paper.title_th}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">
                        Track: <span className="font-medium">{paper.track_name || 'Not specified'}</span>
                    </p>
                </div>
            </div>

            {/* Lifecycle Tabs View */}
            <PaperDetailView
                paper={paper}
                authors={authors}
                files={files}
                assignments={assignments}
                reviews={reviews}
                reviewers={reviewers}
            />
        </AdminPageContainer>
    );
}
