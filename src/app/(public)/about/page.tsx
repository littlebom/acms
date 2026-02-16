import { getEvent } from "@/app/actions/events";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AboutPage() {
    const event = await getEvent();

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">No Active Conference</h1>
                <Link href="/">
                    <Button>Back to Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 md:p-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">About the Event</h1>
                    <h2 className="text-xl text-[#2D4391] font-medium mb-8 border-b border-slate-100 pb-8">
                        {event.title}
                    </h2>

                    <div
                        className="prose prose-slate max-w-none 
                        prose-headings:text-slate-900 
                        prose-p:text-slate-600 prose-p:leading-relaxed
                        prose-li:text-slate-600 prose-li:leading-relaxed
                        prose-strong:text-slate-900
                        prose-a:text-[#2D4391] hover:prose-a:text-[#1e2e6e]
                        [&_img]:rounded-lg [&_img]:shadow-md
                        [&_li]:my-0 [&_ul]:mb-4"
                        dangerouslySetInnerHTML={{ __html: event.description || 'No description available.' }}
                    />
                </div>
            </div>
        </div>
    );
}
