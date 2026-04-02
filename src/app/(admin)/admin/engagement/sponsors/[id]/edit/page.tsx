import { getSponsor, getSponsorUsers } from "@/app/actions/sponsors";
import { notFound } from "next/navigation";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { SponsorForm } from "@/components/admin/sponsor-form";
import { SponsorUserManager } from "@/components/admin/sponsor-user-manager";
import { getSpeakers } from "@/app/actions/speakers"; // Reusing getSpeakers as it fetches all potential users easily

export default async function EditSponsorPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) notFound();

    const sponsor = await getSponsor(id);
    if (!sponsor) notFound();

    const sponsorUsers = await getSponsorUsers(id);
    const allUsers = await getSpeakers(); // All users that can be assigned

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Edit Sponsor"
                description={`Update details for ${sponsor.name_en}`}
            />

            <div className="mt-8 space-y-12 max-w-5xl mx-auto">
                <section>
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <SponsorForm sponsor={sponsor} mode="edit" />
                </section>

                <hr />

                <section>
                    <h3 className="text-lg font-semibold mb-4">User Management</h3>
                    <p className="text-sm text-slate-500 mb-6">Assign users who are associated with this sponsorship.</p>
                    <SponsorUserManager
                        sponsorId={sponsor.id}
                        currentUsers={sponsorUsers}
                        allUsers={allUsers}
                    />
                </section>
            </div>
        </AdminPageContainer>
    );
}
