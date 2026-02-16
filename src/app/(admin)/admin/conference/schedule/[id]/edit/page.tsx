import { getSchedule } from "@/app/actions/schedule";
import { getEvents } from "@/app/actions/events";
import { ScheduleMetadataForm } from "@/components/admin/schedule-metadata-form";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditSchedulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        notFound();
    }

    const schedule = await getSchedule(id);
    if (!schedule) {
        notFound();
    }

    const events = await getEvents();

    return (
        <ScheduleMetadataForm initialData={schedule} events={events} />
    );
}
