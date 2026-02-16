import { getFaqs } from "@/app/actions/chatbot";
import { FaqList } from "@/components/admin/chatbot/faq-list";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminChatbotPage() {
    const faqs = await getFaqs(true); // fetch all, including inactive

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="AI Chatbot"
                description="Configure the automated responses for the frontend help widget."
            />
            <FaqList initialFaqs={faqs} />
        </AdminPageContainer>
    );
}
