import { getPaper } from "@/app/actions/papers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from 'next/link';
import { ReviseForm } from "./revise-form";

export default async function RevisePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const paperId = parseInt(id);
    const paper = await getPaper(paperId);

    if (!paper) {
        return (
            <div className="container py-10">
                <Card className="border-red-200 bg-red-50 text-center py-10">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-700">Paper Not Found</h2>
                    <p className="text-red-600 mb-4">The paper you are trying to revise does not exist (ID: {id}).</p>
                    <Link href="/my-submissions">
                        <Button variant="outline">Back to My Submissions</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    if (paper.status !== 'revision_required') {
        return (
            <div className="container py-10">
                <Card className="border-amber-200 bg-amber-50 text-center py-10">
                    <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-amber-700">Revision Not Required</h2>
                    <p className="text-amber-600 mb-4">This paper is currently in status: <strong>{paper.status}</strong></p>
                    <Link href={`/my-submissions/${id}`}>
                        <Button variant="outline">View Paper Details</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return <ReviseForm paper={paper} />;
}
