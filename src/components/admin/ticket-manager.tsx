'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
    Ticket as TicketIcon,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Calendar,
    Users,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteTicket, type Ticket } from "@/app/actions/registrations";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function TicketManager({ tickets }: { tickets: Ticket[] }) {
    const router = useRouter();
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function confirmDelete() {
        if (!deleteTarget) return;

        setIsDeleting(true);
        const result = await deleteTicket(deleteTarget);
        setIsDeleting(false);

        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
        setDeleteTarget(null);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Ticket Types</CardTitle>
                <Link href="/admin/conference/tickets/create">
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Ticket
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="border rounded-lg p-4 bg-white shadow-sm relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/conference/tickets/${ticket.id}`} className="cursor-pointer">
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-600 focus:text-red-600"
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setDeleteTarget(ticket.id);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <TicketIcon className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-semibold text-lg">{ticket.name}</h3>
                            </div>

                            <div className="mb-4">
                                {Number(ticket.price) === 0 ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-[0.2rem] shadow-sm">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-bold text-sm">FREE</span>
                                    </div>
                                ) : (
                                    <div className="text-2xl font-bold text-slate-900">
                                        ฿{ticket.price.toLocaleString()}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>
                                        {ticket.sold_count} sold
                                        {ticket.quota ? ` / ${ticket.quota} available` : ' (Unlimited)'}
                                    </span>
                                </div>
                                {ticket.available_until && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Until {format(new Date(ticket.available_until), 'MMM d, yyyy HH:mm')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {tickets.length === 0 && (
                        <div className="col-span-full text-center py-8 text-slate-500 border-2 border-dashed rounded-lg">
                            No tickets created yet.
                        </div>
                    )}
                </div>
            </CardContent>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the ticket type.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
