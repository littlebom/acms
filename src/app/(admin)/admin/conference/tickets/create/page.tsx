import { getTickets } from "@/app/actions/registrations";
import { TicketForm } from "@/components/admin/ticket-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function CreateTicketPage() {
    return (
        <AdminPageContainer maxWidth="3xl">
            <div className="flex items-center gap-4">
                <Link href="/admin/conference/tickets">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Create Ticket Type</h1>
                    <p className="text-slate-500">Add a new ticket type for your event</p>
                </div>
            </div>
            <TicketForm />
        </AdminPageContainer>
    );
}
