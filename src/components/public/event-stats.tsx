import { Calendar, MapPin, Users } from "lucide-react";
import { EventData } from "@/app/actions/events";
import { format } from "date-fns";

interface EventStatsProps {
    event: EventData;
}

export function EventStats({ event }: EventStatsProps) {
    const formattedDate = event.start_date
        ? format(new Date(event.start_date), "MMM d, yyyy")
        : "TBA";

    const dateRange = event.start_date && event.end_date
        ? `${format(new Date(event.start_date), "MMM d")} - ${format(new Date(event.end_date), "d, yyyy")}`
        : formattedDate;

    return (
        <section className="py-12 bg-white border-b">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="p-3 rounded-xl bg-indigo-100 text-[#2D4391]">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Date</p>
                            <p className="text-lg font-bold text-slate-900">{dateRange}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Location</p>
                            <p className="text-lg font-bold text-slate-900">{event.venue_name || 'TBA'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Expected Attendees</p>
                            <p className="text-lg font-bold text-slate-900">500+ Participants</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
