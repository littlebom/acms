import { getQuestionnaire, getQuestions } from "@/app/actions/questions";
import { QuestionnairePreview } from "@/components/admin/questionnaire-preview";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function QuestionnairePreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        notFound();
    }

    const questionnaire = await getQuestionnaire(id);

    if (!questionnaire) {
        notFound();
    }

    const questions = await getQuestions(id);

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
                title={`Preview: ${questionnaire.title}`}
                description="This is how the questionnaire will appear to users."
            />
            <QuestionnairePreview
                questionnaire={questionnaire}
                questions={questions}
            />
        </AdminPageContainer>
    );
}
