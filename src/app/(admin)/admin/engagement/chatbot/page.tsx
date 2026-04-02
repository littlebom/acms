import { getFaqs } from "@/app/actions/chatbot";
import { getSystemSettings } from "@/app/actions/settings";
import { FaqList } from "@/components/admin/chatbot/faq-list";
import { ChatbotSettingsForm } from "@/components/admin/chatbot/chatbot-settings-form";
import { ChatbotRagPanel } from "@/components/admin/chatbot/chatbot-rag-panel";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, BookOpen, Database } from "lucide-react";

export default async function AdminChatbotPage() {
    const [faqs, settings] = await Promise.all([
        getFaqs(true),
        getSystemSettings(),
    ]);

    const chatbotSettings = {
        chatbot_name: settings.chatbot_name ?? 'AI Assistant',
        chatbot_enabled: settings.chatbot_enabled ?? true,
        chatbot_provider: (settings.chatbot_provider ?? 'rule_based') as 'rule_based' | 'gemini' | 'openai',
        chatbot_gemini_api_key: settings.chatbot_gemini_api_key ?? '',
        chatbot_gemini_model: settings.chatbot_gemini_model ?? 'gemini-2.0-flash',
        chatbot_openai_api_key: settings.chatbot_openai_api_key ?? '',
        chatbot_openai_model: settings.chatbot_openai_model ?? 'gpt-4o-mini',
        chatbot_system_prompt: settings.chatbot_system_prompt ?? '',
    };

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="AI Chatbot"
                description="Configure the AI assistant, manage knowledge base, and generate RAG context."
            />

            <Tabs defaultValue="settings" className="space-y-6">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Settings className="h-4 w-4" />
                        General Settings
                    </TabsTrigger>
                    <TabsTrigger value="knowledge" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BookOpen className="h-4 w-4" />
                        Knowledge Base
                    </TabsTrigger>
                    <TabsTrigger value="rag" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Database className="h-4 w-4" />
                        RAG Context
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="mt-0">
                    <ChatbotSettingsForm initialSettings={chatbotSettings} />
                </TabsContent>

                <TabsContent value="knowledge" className="mt-0">
                    <FaqList initialFaqs={faqs} />
                </TabsContent>

                <TabsContent value="rag" className="mt-0">
                    <ChatbotRagPanel
                        initialContext={settings.chatbot_context ?? ''}
                        initialUpdatedAt={settings.chatbot_context_updated_at}
                    />
                </TabsContent>
            </Tabs>
        </AdminPageContainer>
    );
}
