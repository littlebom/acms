import { AdminSidebar } from "@/components/admin-sidebar";
import { getEvents } from "@/app/actions/events";
import { getAdminEventId } from "@/lib/admin-event";
import { getSystemSettings } from "@/app/actions/settings";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [events, selectedEventId, settings] = await Promise.all([
        getEvents(),
        getAdminEventId(),
        getSystemSettings(),
    ]);

    return (
        <div className="flex min-h-screen bg-slate-100">
            <AdminSidebar events={events} selectedEventId={selectedEventId} showAcademic={settings.show_proceedings_menu} />
            <main className="flex-1 overflow-y-auto h-screen p-8">
                {children}
            </main>
        </div>
    );
}
