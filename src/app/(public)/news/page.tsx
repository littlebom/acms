
import { getNews } from "@/app/actions/news";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowUpRight, Calendar, Globe } from "lucide-react";
import Image from "next/image";

export const metadata = {
    title: "News & Updates - ACMS",
    description: "Latest news and updates from the conference."
};

export default async function NewsPage() {
    // Fetch only published news
    const { news, error } = await getNews(undefined, true);

    return (
        <div className="container mx-auto px-4 py-16 max-w-7xl">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                    News & <span className="text-primary">Updates</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Stay informed about the latest announcements, speaker reveals, and schedule changes for the upcoming conference.
                </p>
            </div>

            {news && news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {news.map((item) => (
                        <Link
                            key={item.id}
                            href={`/news/${item.id}`}
                            className="group flex flex-col bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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
                                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                                        {item.content.replace(/<[^>]*>?/gm, "").substring(0, 150)}...
                                    </p>
                                )}

                                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-primary flex items-center gap-1 group/btn">
                                        Read Article
                                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="bg-white p-4 rounded-full shadow-sm inline-flex mb-4">
                        <Globe className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No news available yet</h3>
                    <p className="text-slate-500 mt-2">Check back soon for updates.</p>
                </div>
            )}
        </div>
    );
}
