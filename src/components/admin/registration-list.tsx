'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    ExternalLink,
    MoreHorizontal,
    Trash2,
    Eye,
    Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateRegistrationStatus, deleteRegistration, type Registration } from "@/app/actions/registrations";
import { BadgeCard } from '@/components/user/badge-card';

const STATUS_STYLES = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    paid: "bg-green-100 text-green-800 hover:bg-green-100",
    cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function RegistrationList({ registrations, currentUserId }: { registrations: Registration[], currentUserId?: number }) {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const [previewBadge, setPreviewBadge] = useState<Registration | null>(null);

    const filteredRegistrations = registrations.filter(reg => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        const fullName = `${reg.first_name} ${reg.last_name}`.toLowerCase();
        const paddedId = reg.id.toString().padStart(6, '0');

        return fullName.includes(searchLower) ||
            reg.first_name.toLowerCase().includes(searchLower) ||
            reg.last_name.toLowerCase().includes(searchLower) ||
            reg.email.toLowerCase().includes(searchLower) ||
            reg.ticket_name.toLowerCase().includes(searchLower) ||
            reg.id.toString().includes(searchTerm) ||
            paddedId.includes(searchTerm.replace('#', ''));
    });

    async function handleStatusChange(id: number, status: string) {
        // Pass currentUserId when marking as paid
        await updateRegistrationStatus(id, status, status === 'paid' ? currentUserId : undefined);
        router.refresh();
    }

    function handleDelete(id: number, attendeeName: string) {
        setDeleteTarget({ id, name: attendeeName });
    }

    async function confirmDelete() {
        if (!deleteTarget) return;

        const result = await deleteRegistration(deleteTarget.id);
        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
        setDeleteTarget(null);
    }

    const exportToCSV = () => {
        const headers = ['ID', 'Name Last-Name', 'Ticket Type', 'Registered At', 'Status'];
        const rows = filteredRegistrations.map(reg => [
            `"${reg.id.toString().padStart(6, '0')}"`,
            `"${reg.first_name} ${reg.last_name}"`,
            `"${reg.ticket_name}"`,
            `"${format(new Date(reg.registered_at), 'yyyy-MM-dd HH:mm:ss')}"`,
            `"${reg.status}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <CardTitle className="text-lg">Registrations</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search name or ID..."
                                className="pl-9 w-[200px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={exportToCSV}
                            disabled={filteredRegistrations.length === 0}
                        >
                            <Download className="mr-2 h-4 w-4" />
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
                                <TableHead>Ticket</TableHead>
                                <TableHead>Registered At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRegistrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        No registrations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRegistrations.map((reg) => (
                                    <TableRow key={reg.id} className="hover:bg-slate-50/50">
                                        <TableCell className="pl-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={reg.profile_image || undefined} className="object-cover object-top" />
                                                    <AvatarFallback className="text-xs">
                                                        {reg.first_name?.[0]}{reg.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm">{reg.title} {reg.first_name} {reg.last_name}</div>
                                                    <div className="text-xs text-slate-500">#{reg.id.toString().padStart(6, '0')}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{reg.ticket_name}</div>
                                            <div className="text-sm text-slate-500">฿{reg.ticket_price.toLocaleString()}</div>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(reg.registered_at), 'MMM d, yyyy')}
                                            <div className="text-xs text-slate-500">
                                                {format(new Date(reg.registered_at), 'HH:mm')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={STATUS_STYLES[reg.status]}>
                                                {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                                            </Badge>
                                            {reg.status === 'paid' && reg.approver_name && (
                                                <div className="text-xs text-slate-500 mt-1">
                                                    by {reg.approver_name}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setPreviewBadge(reg)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Preview Badge
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(reg.email)}>
                                                        Copy Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'paid')}>
                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                                        Mark as Paid
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'pending')}>
                                                        <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                                        Mark as Pending
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'cancelled')}>
                                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                        Cancel Registration
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onSelect={(e) => {
                                                            e.preventDefault();
                                                            handleDelete(reg.id, `${reg.first_name} ${reg.last_name}`);
                                                        }}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Registration
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Registration</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the registration for <strong>{deleteTarget?.name}</strong>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Badge Preview Dialog */}
            <Dialog open={!!previewBadge} onOpenChange={(open) => !open && setPreviewBadge(null)}>
                <DialogContent className="sm:max-w-md flex justify-center bg-slate-50">
                    <DialogTitle className="sr-only">Badge Preview</DialogTitle>
                    {previewBadge && (
                        <div className="py-4">
                            <BadgeCard
                                user={{
                                    title: previewBadge.title,
                                    first_name: previewBadge.first_name,
                                    last_name: previewBadge.last_name,
                                    email: previewBadge.email,
                                    organization: 'Attendee',
                                    profile_image: previewBadge.profile_image
                                }}
                                event={{
                                    name: 'TCU International e-learning Conference',
                                    date: 'Nov 24-26, 2025',
                                    venue: 'Bangkok Convention Center'
                                }}
                                ticketType={previewBadge.ticket_name}
                                registrationId={`#${previewBadge.id.toString().padStart(6, '0')}`}
                                backgroundImage={previewBadge.ticket_background_image}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
