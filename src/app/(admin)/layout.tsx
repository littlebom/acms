import { AdminSidebar } from "@/components/admin-sidebar";
import { getEvents } from "@/app/actions/events";
import { getAdminEventId } from "@/lib/admin-event";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const events = await getEvents();
    const selectedEventId = await getAdminEventId();

    return (
        <div className="flex min-h-screen bg-slate-100">
            <AdminSidebar events={events} selectedEventId={selectedEventId} />
            <main className="flex-1 overflow-y-auto h-screen p-8">
                {children}
            </main>
        </div>
    );
}
