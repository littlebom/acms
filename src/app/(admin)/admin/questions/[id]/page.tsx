import { getQuestionnaire, getQuestions } from "@/app/actions/questions";
import { QuestionEditor } from "@/components/admin/question-manager";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function QuestionnaireDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
        <QuestionEditor questionnaire={questionnaire} questions={questions} />
    );
}
