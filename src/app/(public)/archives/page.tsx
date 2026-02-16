import { query } from "@/lib/db";
import { EventData, getEvents } from "@/app/actions/events";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

import { getSystemSettings } from "@/app/actions/settings";

export default async function ArchivesPage() {
    // Fetch settings and events
    const settings = await getSystemSettings();
    const events = await getEvents();

    // Split into Active and Past
    const currentEvents = events.filter(e => Number(e.is_active) === 1);
    const pastEvents = events.filter(e => Number(e.is_active) !== 1);

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">
                            {settings.proceedings_title || "Proceedings & Archives"}
                        </h1>
                        <p className="text-lg text-slate-600">
                            {settings.proceedings_description || "Access published papers and conference proceedings from our events."}
                        </p>
                    </div>

                    {/* Current Proceedings Section */}
                    {currentEvents.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Current Proceedings</h2>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            <div className="grid gap-6">
                                {currentEvents.map((event) => (
                                    <EventCard key={event.id} event={event} isCurrent={true} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Archives Section */}
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Past Conferences</h2>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        {pastEvents.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                                <p className="text-slate-500">No archived events found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {pastEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EventCard({ event, isCurrent }: { event: EventData, isCurrent?: boolean }) {
    return (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow group ${isCurrent ? 'border-indigo-100 shadow-indigo-100/50' : 'border-slate-100'}`}>
            <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 min-h-[200px] md:min-h-0 relative">
                    {event.cover_image_url ? (
                        <img
                            src={event.cover_image_url}
                            alt={event.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
                            <BookOpen className="w-12 h-12 opacity-20" />
                        </div>
                    )}
                    {isCurrent && (
                        <div className="absolute top-4 left-4">
                            <Badge className="bg-indigo-600 hover:bg-indigo-700">Current Event</Badge>
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>
                            {event.start_date ? format(new Date(event.start_date), "MMM d, yyyy") : "Date TBA"}
                        </span>
                        <span className="mx-2">•</span>
                        <MapPin className="w-4 h-4" />
                        <span>{event.venue_name || "Venue TBA"}</span>
                    </div>

                    <h2 className={`text-2xl font-bold mb-2 transition-colors ${isCurrent ? 'text-indigo-900 group-hover:text-indigo-700' : 'text-slate-900 group-hover:text-slate-700'}`}>
                        {event.proceedings_name || `Proceedings of the ${event.title}`}
                    </h2>

                    <p className="text-slate-600 mb-6 line-clamp-2">
                        {event.description?.replace(/<[^>]*>?/gm, '') || "No description available."}
                    </p>

                    <Link href={`/archives/${event.slug}`}>
                        <Button
                            variant={isCurrent ? "default" : "outline"}
                            className={`group-hover:translate-x-1 transition-transform ${isCurrent ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                        >
                            View Proceedings
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
