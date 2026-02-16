
import { getNewsById } from "@/app/actions/news";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, ArrowLeft, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { news } = await getNewsById(parseInt(id));

    if (!news) return { title: "News Not Found" };

    return {
        title: `${news.title} - ACMS`,
        description: news.content?.substring(0, 160).replace(/<[^>]*>?/gm, '') || 'Conference News',
    };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { news, error } = await getNewsById(parseInt(id));

    if (error || !news || !news.is_published) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-white pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] md:h-[500px] w-full bg-slate-900 overflow-hidden">
                {news.image_url && (
                    <>
                        <img
                            src={news.image_url}
                            alt={news.title}
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    </>
                )}

                <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-12 max-w-4xl">
                    <Button variant="outline" size="sm" asChild className="self-start mb-6 text-white border-white/20 hover:bg-white/10 hover:text-white backdrop-blur-sm">
                        <Link href="/news" className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to News
                        </Link>
                    </Button>

                    <div className="flex items-center gap-4 text-white/80 text-sm font-medium mb-4">
                        <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(new Date(news.created_at), "MMMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            5 min read
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                        {news.title}
                    </h1>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 max-w-4xl -mt-10 relative z-10">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
                    <div
                        className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-primary prose-img:rounded-2xl prose-img:shadow-md video-container"
                        dangerouslySetInnerHTML={{ __html: news.content || '' }}
                    />


                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                        <div className="text-slate-500 text-sm font-medium">
                            Share this article
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </article >
    );
}
