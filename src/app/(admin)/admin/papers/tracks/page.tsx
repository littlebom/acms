import { getPaperTracks } from "@/app/actions/paper-tracks";
import { TracksTable } from "./tracks-table";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminPaperTracksPage() {
    const tracks = await getPaperTracks(false);

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Paper Tracks"
                description="Manage paper categories and tracks"
            />
            <TracksTable tracks={tracks} />
        </AdminPageContainer>
    );
}
