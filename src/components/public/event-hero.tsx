import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { EventData } from "@/app/actions/events";

interface EventHeroProps {
    event: EventData;
    isArchive?: boolean;
}

export function EventHero({ event, isArchive = false }: EventHeroProps) {
    return (
        <section className={`relative py-20 md:py-32 bg-gradient-to-br ${isArchive ? 'from-slate-800 via-slate-900 to-black' : 'from-[#2D4391] via-[#1e2e6e] to-slate-900'} text-white overflow-hidden`}>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="container mx-auto px-4 relative z-10 text-center">
                {!isArchive && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4FDB90] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4FDB90]"></span>
                        </span>
                        Registration is open!
                    </div>
                )}
                {isArchive && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 text-yellow-500 text-sm font-medium mb-6">
                        Archived Event
                    </div>
                )}

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                    {isArchive && event.proceedings_name ? (
                        event.proceedings_name
                    ) : (
                        <>
                            {isArchive && "Proceedings of the "}
                            {event.title || event.name_en}
                        </>
                    )}
                </h1>

                <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                    {event.name_th || event.short_description || 'Join leading researchers, innovators, and industry experts for a transformative conference experience.'}
                </p>

                {/* Date & Location */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10 text-slate-200">
                    {event.start_date && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-[#4FDB90]" />
                            <span className="font-medium">
                                {format(new Date(event.start_date), 'd MMMM yyyy')}
                                {event.end_date && ` - ${format(new Date(event.end_date), 'd MMMM yyyy')}`}
                            </span>
                        </div>
                    )}
                    {(event.venue_name || event.address) && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[#4FDB90]" />
                            <span className="font-medium">{event.venue_name || event.address}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {!isArchive ? (
                        <>
                            <Link href="/register">
                                <Button size="lg" className="h-12 px-8 text-base bg-white text-[#2D4391] hover:bg-slate-100">
                                    Register Now
                                </Button>
                            </Link>
                            <Link href="/schedule">
                                <Button size="lg" className="h-12 px-8 text-base bg-[#4fdb90] text-white hover:bg-[#4fdb90]/90">
                                    View Schedule
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <Link href="/archives">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                                Back to Archives
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </section >
    );
}
