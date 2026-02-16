import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyPapers } from "@/app/actions/papers";
import { MySubmissionsList } from "./submissions-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function MySubmissionsPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const papers = await getMyPapers();

    return (
        <div className="container mx-auto max-w-5xl py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Submissions</h1>
                    <p className="text-slate-600">
                        Track the status of your submitted papers
                    </p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/submit-paper">
                        <Plus className="h-4 w-4 mr-2" />
                        Submit New Paper
                    </Link>
                </Button>
            </div>

            <MySubmissionsList papers={papers} />
        </div>
    );
}
