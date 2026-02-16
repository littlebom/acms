import { getAvailableEvents } from "@/app/actions/events";
import { EventList } from "@/components/user/event-list";
import { getSession } from "@/lib/auth";

export default async function RegisterConferenceListPage() {
    const session = await getSession();
    // Fetch all available events
    const events = await getAvailableEvents();

    return (
        <div className="container mx-auto max-w-5xl py-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Available Conferences</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Select an event below to view details and register.
                </p>
            </div>

            <EventList events={events} />
        </div>
    );
}
