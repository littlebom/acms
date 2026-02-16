'use client';

import { useState } from 'react';
import {
    Plus,
    Calendar,
    MoreVertical,
    Trash2,
    ExternalLink,
    Pencil,
    Loader2
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
import { deleteSchedule, type Schedule } from "@/app/actions/schedule";
import { type EventData } from "@/app/actions/events";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";

export function ScheduleList({
    schedules,
    events
}: {
    schedules: Schedule[],
    events: EventData[]
}) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleCreate() {
        const { createSchedule } = await import('@/app/actions/schedule');
        const formData = new FormData();
        formData.append('title', 'Untitled Schedule');
        formData.append('description', '');

        const result = await createSchedule(formData);

        if ('scheduleId' in result && result.scheduleId) {
            router.push(`/admin/conference/schedule/${result.scheduleId}/edit`);
        }
    }

    async function confirmDelete() {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await deleteSchedule(deleteId);
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete schedule');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Schedule
                </Button>
            </div>

            <div className="grid gap-4">
                {schedules.map((schedule) => (
                    <div key={schedule.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-slate-900">{schedule.title}</h3>
                                    {schedule.event_title && (
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            {schedule.event_title}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-slate-500 max-w-2xl">
                                    {schedule.description || 'No description provided.'}
                                </p>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => router.push(`/admin/conference/schedule/${schedule.id}/edit`)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push(`/admin/schedule/${schedule.id}`)}>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Manage Schedule
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(schedule.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="px-2 py-1">
                                    <Calendar className="mr-2 h-3 w-3" />
                                    {schedule.session_count || 0} Sessions
                                </Badge>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this schedule? This action cannot be undone and will remove all associated sessions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}

