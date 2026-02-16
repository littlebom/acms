import { getRegistrations } from "@/app/actions/registrations";
import { RegistrationList } from "@/components/admin/registration-list";
import { getSession } from "@/lib/auth";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminRegistrationsPage() {
    const [registrations, session] = await Promise.all([
        getRegistrations(),
        getSession()
    ]);

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Registrations"
                description="View and manage all conference registrations and payment statuses."
            />
            <RegistrationList
                registrations={registrations}
                currentUserId={session?.userId ? Number(session.userId) : undefined}
            />
        </AdminPageContainer>
    );
}
