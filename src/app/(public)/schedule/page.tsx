import { getSchedules, getSchedule, getSessions, type Session } from "@/app/actions/schedule";
import { ScheduleViewer } from "@/components/public/schedule-viewer";

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
    // Logic: Try to find the "TCU International e-learning Conference" schedule (Same as admin mockup)
    // In a real app, this might come from a config or the first active event
    const schedules = await getSchedules();
    const mockEventName = 'TCU International e-learning Conference';
    const activeSchedule = schedules.find(s => s.event_title?.includes(mockEventName) || s.title.includes(mockEventName)) || schedules[0];

    let fullSchedule = null;
    let sessions: Session[] = [];

    if (activeSchedule) {
        fullSchedule = await getSchedule(activeSchedule.id);
        if (fullSchedule) {
            sessions = await getSessions(activeSchedule.id);
        }
    }

    if (!fullSchedule) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Schedule Not Available</h1>
                <p className="text-slate-500">Please check back later.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Hero */}
            <div className="relative py-20 bg-slate-900 text-center text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{fullSchedule.title}</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">{fullSchedule.description || 'Official schedule for the conference'}</p>
                </div>
            </div>

            <div className="container mx-auto py-12 px-4">
                <ScheduleViewer schedule={fullSchedule} sessions={sessions} />
            </div>
        </div>
    );
}
