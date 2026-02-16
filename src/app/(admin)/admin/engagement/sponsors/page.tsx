import { getSponsors } from "@/app/actions/sponsors";
import { SponsorList } from "@/components/admin/sponsor-list";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function AdminSponsorsPage() {
    const sponsors = await getSponsors();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Sponsorship Management"
                description="Manage conference sponsors, their logos, and technical contacts."
            />
            <SponsorList sponsors={sponsors} />
        </AdminPageContainer>
    );
}
