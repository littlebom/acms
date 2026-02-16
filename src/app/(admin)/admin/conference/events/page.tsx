import { getEvents } from "@/app/actions/events";
import { EventList } from "@/components/admin/event-list";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
    const events = await getEvents();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Event Management"
                description="Manage all your conference events. Set the active event to display on the public site."
            />
            <EventList events={events} />
        </AdminPageContainer>
    );
}
