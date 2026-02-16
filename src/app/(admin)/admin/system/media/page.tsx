import { getMediaFiles } from "@/app/actions/media";
import { MediaLibrary } from "@/components/admin/media-library";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminMediaPage() {
    const files = await getMediaFiles();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Media Library"
                description="Upload and manage files for tickets, content, and system assets."
            />
            <MediaLibrary initialFiles={files} />
        </AdminPageContainer>
    );
}
