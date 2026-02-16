import { getEvent } from "@/app/actions/events";
import { getQuestionnaires } from "@/app/actions/questions";
import { getSpeakerGroups } from "@/app/actions/speakers";
import { getSchedules } from "@/app/actions/schedule";
import { EventForm } from "@/components/admin/event-form";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        notFound();
    }

    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    const questionnaires = await getQuestionnaires('pre-event');
    const speakerGroups = await getSpeakerGroups();
    const schedules = await getSchedules();

    return (
        <EventForm
            initialData={event}
            questionnaires={questionnaires}
            speakerGroups={speakerGroups}
            schedules={schedules}
        />
    );
}
