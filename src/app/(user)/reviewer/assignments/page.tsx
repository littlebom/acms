import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyAssignments, getReviewerByUserId } from "@/app/actions/paper-reviews";
import { AssignmentsList } from "./assignments-list";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function ReviewerAssignmentsPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const reviewer = await getReviewerByUserId(session.userId);

    if (!reviewer) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                        <h2 className="text-xl font-bold text-amber-800 mb-2">
                            Not a Registered Reviewer
                        </h2>
                        <p className="text-amber-700">
                            You are not registered as a reviewer. Please contact the administrator if you believe this is an error.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const assignments = await getMyAssignments();

    return (
        <div className="container mx-auto max-w-5xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">My Review Assignments</h1>
                <p className="text-slate-600">
                    Papers assigned to you for review
                </p>
            </div>

            <AssignmentsList assignments={assignments} reviewerId={reviewer.id} />
        </div>
    );
}
