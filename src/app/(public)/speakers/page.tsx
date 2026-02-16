import { getEvents, getEventSpeakers } from "@/app/actions/events";
import { SpeakersList } from "@/components/public/speakers-list";

export const dynamic = 'force-dynamic';

export default async function SpeakersPage() {
    // Logic: Try to find the "TCU International e-learning Conference" speakers
    const events = await getEvents();
    const mockEventName = 'TCU International e-learning Conference';
    const activeEvent = events.find(e => e.name_en?.includes(mockEventName)) || events[0];

    let speakers: any[] = [];
    let eventName = "Conference Speakers";

    if (activeEvent) {
        eventName = activeEvent.name_en;
        speakers = await getEventSpeakers(activeEvent.id);
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Hero */}
            <div className="relative py-20 bg-slate-900 text-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">World-Class Speakers</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Meet the visionaries, researchers, and innovators shaping the future of education at {eventName}.
                    </p>
                </div>
            </div>

            <div className="container mx-auto py-16 px-4">
                <SpeakersList speakers={speakers} />
            </div>
        </div>
    );
}
