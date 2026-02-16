import { getSchedules } from "@/app/actions/schedule";
import { getEvents } from "@/app/actions/events";
import { ScheduleList } from "@/components/admin/schedule-list";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
    const schedules = await getSchedules();
    const events = await getEvents();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Schedule Management"
                description="Manage schedules for your events."
            />
            <ScheduleList schedules={schedules} events={events} />
        </AdminPageContainer>
    );
}
