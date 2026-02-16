import { getQuestionnaireAnalytics, getQuestionnaireResponses } from "@/app/actions/questions";
import { QuestionnaireResults } from "@/components/admin/questionnaire-results";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function QuestionnaireResultsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        notFound();
    }

    const analytics = await getQuestionnaireAnalytics(id);
    const responses = await getQuestionnaireResponses(id);

    if (!analytics) {
        notFound();
    }

    return (
        <AdminPageContainer>
            <div className="mb-4">
                <Link href={`/admin/questions/${id}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Questions
                    </Button>
                </Link>
            </div>
            <AdminPageHeader
                title={`Results: ${analytics.questionnaire.title}`}
                description={`Analyze responses and view statistics for this questionnaire.`}
            />
            <QuestionnaireResults
                analytics={analytics}
                responses={responses as any}
            />
        </AdminPageContainer>
    );
}
