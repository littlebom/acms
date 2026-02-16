import { getQuestionnaires } from "@/app/actions/questions";
import { QuestionnaireList } from "@/components/admin/questionnaire-list";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminQuestionsPage() {
    const questionnaires = await getQuestionnaires();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Questionnaires"
                description="Create and manage forms for registration and feedback."
            />
            <QuestionnaireList questionnaires={questionnaires} />
        </AdminPageContainer>
    );
}
