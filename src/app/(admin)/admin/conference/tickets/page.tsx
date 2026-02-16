import { getTickets } from "@/app/actions/registrations";
import { TicketManager } from "@/components/admin/ticket-manager";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export default async function AdminTicketsPage() {
    const tickets = await getTickets();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Ticket Management"
                description="Create and manage ticket types, pricing, and availability."
            />
            <TicketManager tickets={tickets} />
        </AdminPageContainer>
    );
}
