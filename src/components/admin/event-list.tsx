'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    CheckCircle2,
    Calendar,
    MapPin,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { activateEvent, deleteEvent, type EventData } from "@/app/actions/events";
import { useRouter } from 'next/navigation';

export function EventList({ events }: { events: EventData[] }) {
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [eventToActivate, setEventToActivate] = useState<EventData | null>(null);
    const router = useRouter();

    async function handleConfirmActivate() {
        if (!eventToActivate) return;

        const id = eventToActivate.id;
        setEventToActivate(null); // Close dialog
        setLoadingId(id);

        try {
            await activateEvent(id);
            router.refresh();
        } catch (error) {
            console.error("Failed to activate event:", error);
        } finally {
            setLoadingId(null);
        }
    }

    async function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            setLoadingId(id);
            const result = await deleteEvent(id);
            if (result.error) {
                alert(result.error);
            }
            setLoadingId(null);
            router.refresh();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">All Events</h2>
                <Link href="/admin/conference/events/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Event
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className={`bg-white border rounded-lg p-6 shadow-sm transition-all ${event.is_active ? 'border-2 border-green-500 ring-2 ring-green-500/20' : 'hover:border-slate-300'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl font-bold text-slate-900">{event.name_en}</h3>
                                    {event.is_active ? (
                                        <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Live
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500">Inactive</Badge>
                                    )}
                                </div>
                                {event.name_th && (
                                    <p className="text-slate-500">{event.name_th}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${event.is_active ? 'text-green-700' : 'text-slate-500'}`}>
                                        {event.is_active ? 'Live' : 'Off Air'}
                                    </span>
                                    <Switch
                                        checked={event.is_active}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setEventToActivate(event);
                                            }
                                        }}
                                        disabled={loadingId !== null || event.is_active}
                                        className="data-[state=checked]:bg-green-600"
                                    />
                                </div>

                                <div className="h-8 w-px bg-slate-200 mx-1"></div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" id={`event-actions-${event.id}`}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/admin/conference/events/${event.id}`)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(event.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {event.start_date ? (
                                    <span>
                                        {format(new Date(event.start_date), 'PPP')} - {event.end_date ? format(new Date(event.end_date), 'PPP') : 'TBA'}
                                    </span>
                                ) : (
                                    <span>Date TBA</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span>{event.venue_name || 'Venue TBA'}</span>
                            </div>
                        </div>

                        {loadingId === event.id && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            </div>
                        )}
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg text-slate-500">
                        No events found. Create your first event to get started.
                    </div>
                )}
            </div>

            <AlertDialog open={!!eventToActivate} onOpenChange={(open) => !open && setEventToActivate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Set "{eventToActivate?.name_en}" as LIVE?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will immediately update the public website to display content for this event.
                            Any currently active event will be deactivated.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmActivate} className="bg-green-600 hover:bg-green-700">
                            Confirm Live
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
