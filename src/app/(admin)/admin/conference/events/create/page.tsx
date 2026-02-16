import { getQuestionnaires } from "@/app/actions/questions";
import { getSpeakerGroups } from "@/app/actions/speakers";
import { getSchedules } from "@/app/actions/schedule";
import { EventForm } from "@/components/admin/event-form";

export const dynamic = 'force-dynamic';

export default async function CreateEventPage() {
    const questionnaires = await getQuestionnaires('pre-event');
    const speakerGroups = await getSpeakerGroups();
    const schedules = await getSchedules();

    return (
        <EventForm
            initialData={null}
            questionnaires={questionnaires}
            speakerGroups={speakerGroups}
            schedules={schedules}
        />
    );
}
