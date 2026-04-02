import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { getPageBySlug } from "@/lib/website";
import { getSystemSettings } from "@/app/actions/settings";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Fetch dynamic layout
    const [headerPage, footerPage, settings] = await Promise.all([
        getPageBySlug('system-header'),
        getPageBySlug('system-footer'),
        getSystemSettings(),
    ]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {headerPage?.content_en ? (
                <div dangerouslySetInnerHTML={{ __html: headerPage.content_en }} />
            ) : (
                <PublicNavbar />
            )}

            <main className="flex-1">
                {children}
            </main>

            {footerPage?.content_en ? (
                <div dangerouslySetInnerHTML={{ __html: footerPage.content_en }} />
            ) : (
                <PublicFooter />
            )}
            {settings.chatbot_enabled !== false && <AiChatWidget chatbotName={settings.chatbot_name || 'AI Assistant'} />}
        </div>
    );
}
