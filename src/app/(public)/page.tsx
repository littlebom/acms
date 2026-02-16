import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Globe } from "lucide-react";
import { getEvent, getEventSpeakers } from "@/app/actions/events";
import { getSchedule, getSessions, type Session } from "@/app/actions/schedule";
import { getNews } from "@/app/actions/news";
import { EventHero } from "@/components/public/event-hero";
import { ScheduleViewer } from "@/components/public/schedule-viewer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { VideoPopup } from "@/components/public/video-popup";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    // Fetch Active Event
    const event = await getEvent();

    // Fallback if no active event found
    if (!event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">No Active Conference</h1>
                <p className="text-slate-500 mb-8">Please check back later for upcoming events.</p>
                <Link href="/archives">
                    <Button variant="outline">View Past Events</Button>
                </Link>
            </div>
        );
    }

    // Extract first paragraph for preview
    const description = event.description || '';
    const firstParagraphEnd = description.indexOf('</p>');
    const shortAbout = firstParagraphEnd !== -1
        ? description.substring(0, firstParagraphEnd + 4)
        : (description || 'No description available.');

    // Fetch Schedule if available
    let schedule = null;
    let sessions: Session[] = [];
    if (event.schedule_id) {
        schedule = await getSchedule(event.schedule_id);
        if (schedule) {
            sessions = await getSessions(event.schedule_id);
        }
    }

    // Fetch Speakers
    const allSpeakers = event ? await getEventSpeakers(event.id) : [];
    const featuredSpeakers = allSpeakers.slice(0, 4);

    // Fetch News
    const { news } = await getNews(undefined, true);
    const latestNews = news?.slice(0, 4) || [];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <EventHero event={event} />

            {/* About Preview */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold mb-6 text-slate-900">About Us</h2>
                            <div
                                className="prose prose-slate text-slate-600 mb-6 leading-relaxed max-w-none [&_li]:my-0 [&_ul]:mb-4"
                                dangerouslySetInnerHTML={{ __html: shortAbout }}
                            />
                            <Link href="/about">
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-8 py-6 text-base group shadow-lg hover:shadow-xl transition-all">
                                    Read Full Details
                                    <div className="bg-white/20 rounded-md p-1 ml-3 group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Button>
                            </Link>
                        </div>
                        <div className="flex-1 relative">
                            <div className="aspect-video rounded-lg bg-slate-200 overflow-hidden shadow-2xl relative group">
                                {event.cover_image_url ? (
                                    <img
                                        src={event.cover_image_url}
                                        alt={event.title}
                                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2 opacity-70">
                                            <span className="text-sm font-medium">Event Image</span>
                                        </div>
                                    </div>
                                )}

                                {event.youtube_url && (
                                    <VideoPopup videoUrl={event.youtube_url} />
                                )}
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-dots-pattern opacity-20"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Schedule Preview Section */}
            {schedule && sessions.length > 0 && (
                <section className="py-20 bg-slate-50 border-t border-slate-200">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Conference Agenda</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">
                                Check out some of the key sessions planned for {event.title}.
                            </p>
                        </div>

                        <ScheduleViewer
                            schedule={schedule}
                            sessions={sessions}
                            limit={2}
                            showAllLink="/schedule"
                        />
                    </div>
                </section>
            )}

            {/* Featured Speakers Section */}
            {featuredSpeakers.length > 0 && (
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Speakers</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">
                                Meet some of the distinguished speakers who will be sharing their expertise at {event.title}.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {featuredSpeakers.map((speaker, index) => (
                                <div key={`speaker-${speaker.user_id || index}`} className="group flex">
                                    <div className="bg-slate-50 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-slate-300 w-full flex flex-col">
                                        <div className="mb-4 flex justify-center">
                                            <div className="relative inline-block">
                                                <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                                                    <AvatarImage
                                                        src={speaker.profile_image || undefined}
                                                        className="object-cover object-top"
                                                    />
                                                    <AvatarFallback className="text-3xl bg-slate-200 text-slate-500">
                                                        {speaker.first_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col">
                                            <h3 className="font-semibold text-lg text-slate-900 mb-1">
                                                {(speaker as any).title && (
                                                    <span className="text-slate-600 text-base">{(speaker as any).title} </span>
                                                )}
                                                {speaker.first_name} {speaker.last_name}
                                            </h3>
                                            {(speaker as any).organization && (
                                                <p className="text-sm text-slate-600 mb-2">{(speaker as any).organization}</p>
                                            )}
                                            {speaker.bio && (
                                                <p className="text-sm text-slate-500 line-clamp-2 mt-2">
                                                    {speaker.bio}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-12">
                            <Link href="/speakers">
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-8 py-6 text-base group shadow-lg hover:shadow-xl transition-all">
                                    View All Speakers
                                    <div className="bg-white/20 rounded-md p-1 ml-3 group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Latest News Section */}
            {latestNews.length > 0 && (
                <section className="py-20 bg-slate-50 border-t border-slate-200">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Latest News & Updates</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto">
                                Stay informed with the latest announcements and updates about {event.title}.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {latestNews.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/news/${item.id}`}
                                    className="group flex flex-col bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="aspect-video relative bg-slate-100 overflow-hidden">
                                        {item.image_url ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                                                <Globe className="h-10 w-10" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                                            News
                                        </div>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
                                            <Calendar className="h-3.5 w-3.5 text-primary" />
                                            {format(new Date(item.created_at), "MMMM d, yyyy")}
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>

                                        {item.content && (
                                            <p className="text-slate-600 text-sm line-clamp-2 flex-1 leading-relaxed">
                                                {item.content.replace(/<[^>]*>?/gm, "").substring(0, 100)}...
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="flex justify-center mt-12">
                            <Link href="/news">
                                <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-8 py-6 text-base group shadow-lg hover:shadow-xl transition-all">
                                    View All News
                                    <div className="bg-white/20 rounded-md p-1 ml-3 group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
