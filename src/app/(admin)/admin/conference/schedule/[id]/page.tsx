import { getSchedule, getSessions, getScheduleAvailableSpeakers } from "@/app/actions/schedule";
import { ScheduleEditor } from "@/components/admin/schedule-editor";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        notFound();
    }

    const schedule = await getSchedule(id);
    if (!schedule) {
        notFound();
    }

    const sessions = await getSessions(id);

    // Fetch speakers specifically available for this schedule's event
    const availableSpeakers = await getScheduleAvailableSpeakers(id);

    return (
        <ScheduleEditor
            schedule={schedule}
            sessions={sessions}
            allSpeakers={availableSpeakers}
        />
    );
}
