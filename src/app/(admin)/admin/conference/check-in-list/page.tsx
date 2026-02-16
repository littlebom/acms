import { getAttendees, getAttendeeStats } from "@/app/actions/attendees";
import { getEvents } from "@/app/actions/events";
import { AttendeesTable } from "./attendees-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Clock, CheckCircle2, ScanLine } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function AdminAttendeesPage({
    searchParams
}: {
    searchParams: { eventId?: string }
}) {
    // Handle async searchParams (Next.js 15)
    const resolvedParams = await Promise.resolve(searchParams);
    const eventId = resolvedParams?.eventId ? parseInt(resolvedParams.eventId) : undefined;

    const [attendees, stats, events] = await Promise.all([
        getAttendees(eventId),
        getAttendeeStats(eventId),
        getEvents()
    ]);

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Attendees"
                description="Manage event attendees and check-in status"
                actions={
                    <Button asChild>
                        <Link href="/admin/conference/check-in">
                            <ScanLine className="mr-2 h-4 w-4" />
                            Check-in Scanner
                        </Link>
                    </Button>
                }
            />


            <AttendeesTable
                attendees={attendees}
                events={events}
                selectedEventId={eventId}
            />
        </AdminPageContainer>
    );
}
