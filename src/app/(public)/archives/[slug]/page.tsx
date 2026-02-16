import { getEventProceedings } from "@/app/actions/events";
import { EventHero } from "@/components/public/event-hero";

import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { ProceedingsList } from "@/components/public/proceedings-list";

export default async function ArchiveDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getEventProceedings(slug);

    if (!data || !data.event) {
        notFound();
    }

    const { event, papers } = data;

    return (
        <div className="flex flex-col min-h-screen">
            <EventHero event={event} isArchive={true} />



            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">


                    {/* Proceedings Section */}
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-200">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-800">Conference Proceedings</h2>
                        </div>

                        {papers && papers.length > 0 ? (
                            <ProceedingsList papers={papers} />
                        ) : (
                            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">Proceedings Not Available</h3>
                                <p className="text-slate-500">
                                    The proceedings for this conference have not been published online yet.
                                    <br />
                                    Please check back later or contact the administration.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-20">
                        <Link href="/archives">
                            <Button size="lg" variant="outline">
                                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                                Back to All Archives
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
