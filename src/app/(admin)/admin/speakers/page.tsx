import { getSpeakerGroups } from "@/app/actions/speakers";
import { getEvents } from "@/app/actions/events";
import { SpeakerGroupList } from "@/components/admin/speaker-group-list";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function AdminSpeakersPage() {
    const groups = await getSpeakerGroups();
    const events = await getEvents();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Speaker Management"
                description="Create and manage lists of speakers for your events."
            />
            <SpeakerGroupList groups={groups} events={events} />
        </AdminPageContainer>
    );
}
