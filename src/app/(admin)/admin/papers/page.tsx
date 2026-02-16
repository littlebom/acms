import { getPapers, getPaperStats } from "@/app/actions/papers";
import { getPaperTracks } from "@/app/actions/paper-tracks";
import { PapersTable } from "./papers-table";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2, XCircle, Send, BookOpen } from "lucide-react";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminPapersPage() {
    const [papers, stats, tracks] = await Promise.all([
        getPapers(),
        getPaperStats(),
        getPaperTracks()
    ]);

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Paper Submissions"
                description="Manage submitted papers and assign reviewers"
            />



            <PapersTable papers={papers} tracks={tracks} />
        </AdminPageContainer>
    );
}
