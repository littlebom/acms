import { getAbstractBookData } from "@/app/actions/papers";
import { getPaperTracks } from "@/app/actions/paper-tracks";
import { AdminPageContainer } from "@/components/admin/admin-page-header";
import { AbstractBookContent } from "./abstract-book-content";
import { PrintButton } from "./print-button";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AbstractBookPage({
    searchParams
}: {
    searchParams: { track_id?: string }
}) {
    const trackId = searchParams.track_id ? parseInt(searchParams.track_id) : undefined;
    const [papers, tracks] = await Promise.all([
        getAbstractBookData({ track_id: trackId }),
        getPaperTracks()
    ]);

    return (
        <AdminPageContainer>
            {/* Header - Not visible during print */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 no-print">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/admin/papers">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <BookOpen className="h-8 w-8 text-primary" />
                            Abstract Book
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {papers.length} accepted papers found.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <PrintButton />
                </div>
            </div>

            {/* Book Content */}
            <div className="bg-slate-50/50 p-4 md:p-12 min-h-screen rounded-3xl border border-slate-200/60 print:bg-white print:p-0 print:border-none">
                <AbstractBookContent papers={papers} />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { 
                        background: white !important; 
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .AdminPageContainer { padding: 0 !important; }
                    main { padding: 0 !important; }
                }
            `}} />
        </AdminPageContainer>
    );
}
