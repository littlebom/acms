import { getTickets } from "@/app/actions/registrations";
import { TicketForm } from "@/components/admin/ticket-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        notFound();
    }

    const tickets = await getTickets();
    const ticket = tickets.find(t => t.id === id);

    if (!ticket) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/conference/tickets">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Edit Ticket Type</h1>
                    <p className="text-slate-500">Update ticket: {ticket.name}</p>
                </div>
            </div>

            <div className="max-w-3xl">
                <TicketForm ticket={ticket} />
            </div>
        </div>
    );
}
