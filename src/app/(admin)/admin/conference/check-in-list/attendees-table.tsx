'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, CheckCircle2, Clock, UserX, Undo2, Loader2, Download } from "lucide-react";
import type { Attendee } from "@/app/actions/attendees";
import type { EventData } from "@/app/actions/events";
import { undoCheckIn } from "@/app/actions/check-in";

interface AttendeesTableProps {
    attendees: Attendee[];
    events: EventData[];
    selectedEventId?: number;
}

export function AttendeesTable({ attendees, events, selectedEventId }: AttendeesTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [undoingId, setUndoingId] = useState<number | null>(null);

    // Handle undo check-in
    const handleUndoCheckIn = async (registrationId: number) => {
        setUndoingId(registrationId);
        try {
            const result = await undoCheckIn(registrationId);
            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Failed to undo check-in');
            }
        } catch (error) {
            alert('An error occurred while undoing check-in');
        } finally {
            setUndoingId(null);
        }
    };

    // Filter attendees - only show checked-in attendees and filter by search
    const filteredAttendees = attendees.filter(att => {
        // Only show checked-in attendees
        if (!att.checked_in_at) return false;

        // Search filter
        if (!searchQuery) return true;

        const searchLower = searchQuery.toLowerCase();
        const fullName = `${att.first_name} ${att.last_name}`.toLowerCase();
        const paddedId = att.id.toString().padStart(6, '0');
        return fullName.includes(searchLower) ||
            att.first_name.toLowerCase().includes(searchLower) ||
            att.last_name.toLowerCase().includes(searchLower) ||
            att.email.toLowerCase().includes(searchLower) ||
            att.id.toString().includes(searchQuery) ||
            paddedId.includes(searchQuery.replace('#', ''));
    });

    // Export to CSV function
    const exportToCSV = () => {
        const headers = ['Registration ID', 'Full Name', 'Event', 'Ticket Type', 'Check-in Time'];
        const rows = filteredAttendees.map(att => [
            `#${att.id.toString().padStart(6, '0')}`,
            `${att.title || ''} ${att.first_name} ${att.last_name}`.trim(),
            att.event_name,
            att.ticket_name,
            att.checked_in_at ? new Date(att.checked_in_at).toLocaleString() : ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `checked-in-attendees-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const handleEventChange = (value: string) => {
        if (value === 'all') {
            router.push('/admin/attendees');
        } else {
            router.push(`/admin/attendees?eventId=${value}`);
        }
    };

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <CardTitle className="text-lg">Attendee List</CardTitle>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-[200px]"
                            />
                        </div>
                        {/* Export Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToCSV}
                            disabled={filteredAttendees.length === 0}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-4 py-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50">
                                <TableHead className="pl-4">Name Last-Name</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Ticket Type</TableHead>
                                <TableHead>Check-in</TableHead>
                                <TableHead className="text-right pr-4">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttendees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        No attendees found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAttendees.map((att) => (
                                    <TableRow key={att.id} className="hover:bg-slate-50/50">
                                        <TableCell className="pl-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={att.profile_image} className="object-cover object-top" />
                                                    <AvatarFallback className="text-xs">
                                                        {att.first_name?.[0]}{att.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {att.title} {att.first_name} {att.last_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">#{att.id.toString().padStart(6, '0')}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-slate-700 line-clamp-1" title={att.event_name}>
                                                {att.event_name}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {att.ticket_name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {att.checked_in_at ? (
                                                <div className="flex items-center gap-1.5 text-emerald-700">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="text-xs font-medium">
                                                        {new Date(att.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <UserX className="h-3.5 w-3.5" />
                                                    Not yet
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            {att.checked_in_at && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            disabled={undoingId === att.id}
                                                        >
                                                            {undoingId === att.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Undo2 className="h-4 w-4 mr-1" />
                                                                    Undo
                                                                </>
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>ยกเลิกการ Check-in?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                คุณต้องการยกเลิกการ check-in ของ {att.title} {att.first_name} {att.last_name} หรือไม่?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleUndoCheckIn(att.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                ยืนยัน
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
