'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Calendar,
    Clock,
    MapPin,
    Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createSession, updateSession, deleteSession, type Session } from "@/app/actions/schedule";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import type { EventData } from '@/app/actions/events';

const SESSION_TYPES = [
    { value: 'keynote', label: 'Keynote', color: 'bg-purple-100 text-purple-800' },
    { value: 'panel', label: 'Panel Discussion', color: 'bg-blue-100 text-blue-800' },
    { value: 'workshop', label: 'Workshop', color: 'bg-green-100 text-green-800' },
    { value: 'presentation', label: 'Paper Presentation', color: 'bg-orange-100 text-orange-800' },
    { value: 'break', label: 'Break / Networking', color: 'bg-slate-100 text-slate-800' },
];

function SessionForm({
    session,
    eventId,
    onClose
}: {
    session?: Session | null,
    eventId: number,
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('event_id', eventId.toString());

        if (session) {
            formData.append('id', session.id.toString());
            await updateSession(formData);
        } else {
            await createSession(formData);
        }
        setLoading(false);
        onClose();
    }

    // Helper to format date for input
    const formatDate = (date?: Date | string) => {
        if (!date) return '';
        return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={session?.title}
                    required
                    placeholder="e.g. Opening Keynote"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                        type="datetime-local"
                        id="start_time"
                        name="start_time"
                        defaultValue={formatDate(session?.start_time)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                        type="datetime-local"
                        id="end_time"
                        name="end_time"
                        defaultValue={formatDate(session?.end_time)}
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="room">Room / Location</Label>
                    <Input
                        id="room"
                        name="room"
                        defaultValue={session?.room || ''}
                        placeholder="e.g. Grand Hall A"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Session Type</Label>
                    <Select name="type" defaultValue={session?.type || 'presentation'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {SESSION_TYPES.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={session?.description || ''}
                    placeholder="Brief description of the session..."
                />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {session ? 'Update Session' : 'Create Session'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function ScheduleManager({
    sessions,
    events,
    currentEventId
}: {
    sessions: Session[],
    events: EventData[],
    currentEventId: number
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const router = useRouter();

    async function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this session?')) {
            await deleteSession(id);
        }
    }

    // Group sessions by date
    const groupedSessions = sessions.reduce((acc, session) => {
        const date = format(new Date(session.start_time), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(session);
        return acc;
    }, {} as Record<string, Session[]>);

    const sortedDates = Object.keys(groupedSessions).sort();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                    <Label htmlFor="event-select" className="whitespace-nowrap font-medium">Select Event:</Label>
                    <Select
                        value={currentEventId.toString()}
                        onValueChange={(val) => router.push(`/admin/schedule?eventId=${val}`)}
                    >
                        <SelectTrigger className="w-[250px] bg-white">
                            <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                            {events.map(event => (
                                <SelectItem key={event.id} value={event.id.toString()}>
                                    {event.name_en} {event.is_active && '(Active)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Add New Session</DialogTitle>
                            <DialogDescription>
                                Create a session for the selected event.
                            </DialogDescription>
                        </DialogHeader>
                        <SessionForm
                            eventId={currentEventId}
                            onClose={() => setIsCreateOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-slate-50 text-slate-500">
                    <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No sessions scheduled for this event yet.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map(date => (
                        <div key={date} className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700 sticky top-0 bg-white py-2 z-10 border-b">
                                <Calendar className="h-5 w-5" />
                                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                            </h3>

                            <div className="grid gap-4">
                                {groupedSessions[date].map(session => (
                                    <div key={session.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4">
                                        <div className="flex flex-col items-center justify-center min-w-[100px] border-r pr-4 py-2 text-slate-600">
                                            <span className="text-lg font-bold">{format(new Date(session.start_time), 'HH:mm')}</span>
                                            <span className="text-xs text-slate-400">to</span>
                                            <span className="text-sm font-medium">{format(new Date(session.end_time), 'HH:mm')}</span>
                                        </div>

                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="secondary" className={SESSION_TYPES.find(t => t.value === session.type)?.color}>
                                                            {SESSION_TYPES.find(t => t.value === session.type)?.label}
                                                        </Badge>
                                                        {session.room && (
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {session.room}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className="font-semibold text-lg text-slate-900">{session.title}</h4>
                                                    {session.description && (
                                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                                            {session.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="-mt-1" id={`session-actions-${session.id}`}>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setEditingSession(session)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(session.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Session</DialogTitle>
                    </DialogHeader>
                    {editingSession && (
                        <SessionForm
                            session={editingSession}
                            eventId={currentEventId}
                            onClose={() => setEditingSession(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
