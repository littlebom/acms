import { getQuestionnaire, getQuestions } from "@/app/actions/questions";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { SurveyForm } from "@/components/user/survey-form";

export const dynamic = 'force-dynamic';

export default async function TakeSurveyPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        notFound();
    }

    const questionnaire = await getQuestionnaire(id);
    if (!questionnaire || !questionnaire.is_active) {
        notFound();
    }

    const questions = await getQuestions(id);

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <SurveyForm
                questionnaire={questionnaire}
                questions={questions}
            />
        </div>
    );
}
