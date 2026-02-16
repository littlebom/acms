import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { SponsorForm } from "@/components/admin/sponsor-form";

export default function AddSponsorPage() {
    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Add New Sponsor"
                description="Register a new company as a conference sponsor."
                showBackButton
            />
            <div className="mt-8 max-w-5xl mx-auto">
                <SponsorForm mode="add" />
            </div>
        </AdminPageContainer>
    );
}
