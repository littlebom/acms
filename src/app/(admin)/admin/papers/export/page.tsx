import { getPaperTracks } from "@/app/actions/paper-tracks";
import { ExportPage } from "./export-client";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminPapersExportPage() {
    const tracks = await getPaperTracks(false);

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Export Reports"
                description="Export paper submissions, reviews, and reviewer data"
            />
            <ExportPage tracks={tracks} />
        </AdminPageContainer>
    );
}
