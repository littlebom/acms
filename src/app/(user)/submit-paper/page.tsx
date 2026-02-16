import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPaperTracks } from "@/app/actions/paper-tracks";
import { getEvent } from "@/app/actions/events";
import { PaperSubmissionForm } from "./paper-form";

export default async function SubmitPaperPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const [tracks, event] = await Promise.all([
        getPaperTracks(true),
        getEvent()
    ]);

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Submit Paper</h1>
                <p className="text-slate-600">
                    Submit your research paper for review. Please fill in all required fields carefully.
                </p>
            </div>

            <PaperSubmissionForm
                tracks={tracks}
                eventId={event?.id}
                userId={session.userId}
            />
        </div>
    );
}
