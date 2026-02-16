'use client';

import { useState, useMemo, useEffect } from 'react';
import { format, addDays, parseISO, isSameDay } from 'date-fns';
import {
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Calendar,
    MapPin,
    Loader2,
    ArrowLeft,
    Clock,
    CalendarPlus,
    LayoutGrid,
    LayoutTemplate,
    X,
    Settings,
    User,
    Check,
    Paperclip,
    FileText,
    UserPlus,
    Download
} from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    createSession,
    updateSession,
    deleteSession,
    updateScheduleSettings,
    deleteSessionAttachment,
    renameRoom,
    swapSessionTimes,
    moveSessionsToNewDate,
    type Session,
    type Schedule,
    type ScheduleSettings
} from "@/app/actions/schedule";
import { toCSV, SCHEDULE_CSV_COLUMNS } from "@/lib/csv-utils";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Type for Speaker (User)
interface Speaker {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    profile_image: string | null;
}

const SESSION_TYPES = [
    { value: 'keynote', label: 'Keynote', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'panel', label: 'Panel Discussion', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'workshop', label: 'Workshop', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'presentation', label: 'Paper Presentation', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'break', label: 'Break / Networking', color: 'bg-slate-100 text-slate-800 border-slate-200' },
];

function DayForm({
    date,
    existingDays,
    onSubmit,
    onClose
}: {
    date?: string,
    existingDays: string[],
    onSubmit: (newDate: string) => Promise<void>,
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(date || format(new Date(), 'yyyy-MM-dd'));

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (existingDays.includes(selectedDate) && selectedDate !== date) {
            alert('This date already exists in the schedule.');
            return;
        }
        setLoading(true);
        await onSubmit(selectedDate);
        setLoading(false);
        onClose();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="day-date">Date</Label>
                <Input
                    type="date"
                    id="day-date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {date ? 'Update Date' : 'Add Date'}
                </Button>
            </DialogFooter>
        </form>
    );
}

function SessionForm({
    session,
    scheduleId,
    defaultDate,
    defaultRoom,
    allSpeakers,
    onClose
}: {
    session?: Session | null,
    scheduleId: number,
    defaultDate?: string,
    defaultRoom?: string,
    allSpeakers: Speaker[],
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false);
    const [selectedSpeakers, setSelectedSpeakers] = useState<number[]>(
        session?.speakers?.map(s => s.id) || []
    );
    const [selectedChair, setSelectedChair] = useState<number | null>(session?.chair?.id || null);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [openChairCombobox, setOpenChairCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [chairSearchQuery, setChairSearchQuery] = useState("");
    const router = useRouter();

    // ... (rest of the code unchanged: baseDate, handleSubmit, formatTime, toggleSpeaker, handleDeleteAttachment) ...

    // Determine the base date for this session
    const baseDate = session
        ? format(new Date(session.start_time), 'yyyy-MM-dd')
        : (defaultDate || format(new Date(), 'yyyy-MM-dd'));

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('schedule_id', scheduleId.toString());

        // Construct full ISO datetime strings from time inputs
        const startTimeInput = formData.get('start_time_input') as string;
        const endTimeInput = formData.get('end_time_input') as string;

        if (startTimeInput) {
            formData.set('start_time', `${baseDate}T${startTimeInput}`);
        }
        if (endTimeInput) {
            formData.set('end_time', `${baseDate}T${endTimeInput}`);
        }

        // Append selected speakers
        selectedSpeakers.forEach(id => formData.append('speakers', id.toString()));

        if (selectedChair) {
            formData.append('chair_id', selectedChair.toString());
        }

        if (session) {
            formData.append('id', session.id.toString());
            await updateSession(formData);
        } else {
            await createSession(formData);
        }
        setLoading(false);
        onClose();
    }

    // Helper to format time for input (HH:mm)
    const formatTime = (date?: Date | string) => {
        if (!date) return '09:00';
        return format(new Date(date), 'HH:mm');
    };

    const toggleSpeaker = (speakerId: number) => {
        setSelectedSpeakers(prev =>
            prev.includes(speakerId)
                ? prev.filter(id => id !== speakerId)
                : [...prev, speakerId]
        );
    };

    const handleDeleteAttachment = async (attachmentId: number) => {
        if (confirm('Delete this file?')) {
            await deleteSessionAttachment(attachmentId, scheduleId);
            router.refresh();
        }
    };

    // Filter speakers based on search query
    const filteredSpeakers = allSpeakers.filter(speaker => {
        const query = searchQuery.toLowerCase();
        return (
            speaker.first_name.toLowerCase().includes(query) ||
            speaker.last_name.toLowerCase().includes(query) ||
            (speaker.email && speaker.email.toLowerCase().includes(query))
        );
    });

    const filteredChairs = allSpeakers.filter(speaker => {
        const query = chairSearchQuery.toLowerCase();
        return (
            speaker.first_name.toLowerCase().includes(query) ||
            speaker.last_name.toLowerCase().includes(query) ||
            (speaker.email && speaker.email.toLowerCase().includes(query))
        );
    });

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
                    <Label htmlFor="start_time_input">Start Time</Label>
                    <Input
                        type="time"
                        id="start_time_input"
                        name="start_time_input"
                        defaultValue={formatTime(session?.start_time)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end_time_input">End Time</Label>
                    <Input
                        type="time"
                        id="end_time_input"
                        name="end_time_input"
                        defaultValue={formatTime(session?.end_time)}
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
                        defaultValue={session?.room || defaultRoom || ''}
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
                <Label>Speakers</Label>

                {/* Selected Speakers List (More explicit Add/Delete) */}
                <div className="space-y-2 mb-2">
                    {selectedSpeakers.length > 0 ? (
                        selectedSpeakers.map(id => {
                            const speaker = allSpeakers.find(s => s.id === id);
                            if (!speaker) return null;
                            return (
                                <div key={id} className="flex items-center justify-between p-2 border rounded-md bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={speaker.profile_image || undefined} className="object-cover object-top" />
                                            <AvatarFallback>{speaker.first_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{speaker.first_name} {speaker.last_name}</p>
                                            <p className="text-xs text-slate-500">{speaker.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => toggleSpeaker(id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-sm text-slate-500 italic p-2 border border-dashed rounded-md text-center">
                            No speakers selected yet.
                        </div>
                    )}
                </div>

                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Speaker
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-2" align="start">
                        <Input
                            placeholder="Search speakers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mb-2"
                            autoFocus
                        />
                        <div className="max-h-[300px] overflow-y-auto space-y-1">
                            {filteredSpeakers.length === 0 ? (
                                <div className="text-sm text-center text-slate-500 py-4">
                                    No speaker found.
                                </div>
                            ) : (
                                filteredSpeakers.map((speaker) => (
                                    <button
                                        key={speaker.id}
                                        onClick={() => {
                                            toggleSpeaker(speaker.id);
                                            setOpenCombobox(false);
                                        }}
                                        className="flex items-center w-full p-2 hover:bg-slate-100 rounded-md transition-colors text-left"
                                    >
                                        <div className={cn(
                                            "mr-2 flex items-center justify-center w-4 h-4 rounded-sm border border-primary",
                                            selectedSpeakers.includes(speaker.id) ? "bg-primary text-primary-foreground" : "opacity-50"
                                        )}>
                                            {selectedSpeakers.includes(speaker.id) && <Check className="h-3 w-3" />}
                                        </div>
                                        <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage src={speaker.profile_image || undefined} className="object-cover object-top" />
                                            <AvatarFallback>{speaker.first_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {speaker.first_name} {speaker.last_name}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <Label htmlFor="chair">Chair</Label>
                <div className="space-y-2 mb-2">
                    {selectedChair ? (
                        (() => {
                            const chair = allSpeakers.find(s => s.id === selectedChair);
                            if (!chair) return null;
                            return (
                                <div className="flex items-center justify-between p-2 border rounded-md bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={chair.profile_image || undefined} className="object-cover object-top" />
                                            <AvatarFallback>{chair.first_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{chair.first_name} {chair.last_name}</p>
                                            <p className="text-xs text-slate-500">{chair.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => setSelectedChair(null)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })()
                    ) : (
                        <div className="text-sm text-slate-500 italic p-2 border border-dashed rounded-md text-center">
                            No chair selected.
                        </div>
                    )}
                </div>

                <Popover open={openChairCombobox} onOpenChange={setOpenChairCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openChairCombobox}
                            className="w-full justify-center text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            {selectedChair ? 'Change Chair' : 'Add Chair'}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-2" align="start">
                        <Input
                            placeholder="Search users..."
                            value={chairSearchQuery}
                            onChange={(e) => setChairSearchQuery(e.target.value)}
                            className="mb-2"
                            autoFocus
                        />
                        <div className="max-h-[300px] overflow-y-auto space-y-1">
                            {filteredChairs.length === 0 ? (
                                <div className="text-sm text-center text-slate-500 py-4">
                                    No user found.
                                </div>
                            ) : (
                                filteredChairs.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            setSelectedChair(user.id);
                                            setOpenChairCombobox(false);
                                        }}
                                        className="flex items-center w-full p-2 hover:bg-slate-100 rounded-md transition-colors text-left"
                                    >
                                        <div className={cn(
                                            "mr-2 flex items-center justify-center w-4 h-4 rounded-sm border border-primary",
                                            selectedChair === user.id ? "bg-primary text-primary-foreground" : "opacity-0"
                                        )}>
                                            <Check className="h-3 w-3" />
                                        </div>
                                        <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage src={user.profile_image || undefined} className="object-cover object-top" />
                                            <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {user.first_name} {user.last_name}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="space-y-2">
                <Label htmlFor="files">Attachments (PDF, Slides)</Label>
                <Input
                    id="files"
                    name="files"
                    type="file"
                    multiple
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                />

                {/* Existing Attachments */}
                {session?.attachments && session.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {session.attachments.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2 border rounded bg-slate-50 text-sm">
                                <div className="flex items-center gap-2 truncate">
                                    <FileText className="h-4 w-4 text-slate-500" />
                                    <a href={file.file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]">
                                        {file.file_name}
                                    </a>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-red-500"
                                    onClick={() => handleDeleteAttachment(file.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
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

// Sortable Item Component
function SortableSessionItem({ session, onDelete, onEdit }: { session: Session, onDelete: (id: number) => void, onEdit: (session: Session) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: session.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none outline-none">
            <div
                className={`group relative bg-white border border-slate-200 rounded-[5px] p-5 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${isDragging ? 'shadow-2xl ring-2 ring-primary/20 rotate-1' : ''}`}
            >
                <div className="flex flex-col md:flex-row gap-5">
                    {/* Time Column */}
                    <div className="md:w-32 flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-5 cursor-move">
                        <div className="text-lg font-bold text-slate-800">
                            {format(new Date(session.start_time), 'HH:mm')}
                        </div>
                        <div className="text-xs font-medium text-slate-400 mb-2">
                            to {format(new Date(session.end_time), 'HH:mm')}
                        </div>
                        <Badge variant="outline" className={`${SESSION_TYPES.find(t => t.value === session.type)?.color || 'bg-slate-50 text-slate-600'} border-0 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold w-fit`}>
                            {SESSION_TYPES.find(t => t.value === session.type)?.label}
                        </Badge>
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                        {/* Edit/Delete Actions overlay (Top Right) */}
                        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 backdrop-blur-sm p-1 rounded-md shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-600 hover:bg-slate-100"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent drag
                                    onEdit(session);
                                }}
                                onPointerDown={(e) => e.stopPropagation()} // Prevent DnD on button
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:bg-red-50"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent drag
                                    onDelete(session.id);
                                }}
                                onPointerDown={(e) => e.stopPropagation()} // Prevent DnD on button
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                            {session.title}
                        </h3>
                        {session.description && (
                            <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                                {session.description}
                            </p>
                        )}

                        {/* Chair */}
                        {session.chair && (
                            <div className="flex items-center gap-2 mt-3 mb-2">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chair:</span>
                                <div className="flex items-center gap-2 bg-purple-50 rounded-full pl-0.5 pr-6 py-0.5 border border-purple-100">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={session.chair.profile_image || undefined} className="object-cover object-top" />
                                        <AvatarFallback className="text-[9px] bg-white">{session.chair.first_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium text-purple-900">{session.chair.first_name} {session.chair.last_name}</span>
                                </div>
                            </div>
                        )}

                        {/* Speakers */}
                        {session.speakers && session.speakers.length > 0 && (
                            <div className="flex items-start gap-2 mt-3">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Speakers:</span>
                                <div className="flex flex-wrap gap-2">
                                    {session.speakers.map(speaker => (
                                        <div key={speaker.id} className="flex items-center gap-2 bg-slate-50 rounded-full pl-0.5 pr-2 py-0.5 border border-slate-100">
                                            <Avatar className="h-5 w-5">
                                                <AvatarImage src={speaker.profile_image || undefined} className="object-cover object-top" />
                                                <AvatarFallback className="text-[9px] bg-white">{speaker.first_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs font-medium text-slate-700">{speaker.first_name} {speaker.last_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        {session.attachments && session.attachments.length > 0 && (
                            <div className="flex items-center gap-2 mt-3 text-xs text-blue-600">
                                <Paperclip className="h-3 w-3" />
                                <span>{session.attachments.length} resource(s) attached</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ScheduleEditor({
    schedule,
    sessions,
    allSpeakers
}: {
    schedule: Schedule,
    sessions: Session[],
    allSpeakers: Speaker[]
}) {
    const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
    const [isDayFormOpen, setIsDayFormOpen] = useState(false);
    const [editingDay, setEditingDay] = useState<string | null>(null);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [activeTab, setActiveTab] = useState<string>("");
    const [targetDate, setTargetDate] = useState<string | undefined>(undefined);
    const [targetRoom, setTargetRoom] = useState<string | undefined>(undefined);
    const router = useRouter();

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Parse settings
    const settings: ScheduleSettings = typeof schedule.settings === 'string'
        ? JSON.parse(schedule.settings)
        : (schedule.settings || { days: [], rooms: [] });

    const days = settings.days || [];
    const rooms = settings.rooms || [];

    // Initialize active tab and room
    useEffect(() => {
        if (activeTab === "" && days.length > 0) {
            setActiveTab(days[0]);
        }
    }, [days, activeTab]);

    useEffect(() => {
        if (activeTab && rooms.length > 0 && !targetRoom) {
            // Default to first room if none selected, or keep current if valid
            // Ideally simply select the first room if we switched days? 
            // Or just select first room available. 
            // Let's default to first room if current targetRoom is not in rooms list or undefined
            if (!targetRoom || !rooms.includes(targetRoom)) {
                setTargetRoom(rooms[0]);
            }
        }
    }, [activeTab, rooms, targetRoom]);


    // Filter sessions for current view
    const filteredSessions = useMemo(() => {
        if (!activeTab || !targetRoom) return [];
        return sessions.filter(s => {
            // Robust date comparison handling local time
            // activeTab is 'YYYY-MM-DD' string
            const sessionDate = new Date(s.start_time);
            const tabDate = parseISO(activeTab);

            const dateMatch = isSameDay(sessionDate, tabDate);
            const roomMatch = s.room === targetRoom;

            return dateMatch && roomMatch;
        }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    }, [sessions, activeTab, targetRoom]);

    // Handle DnD End
    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeId = active.id as number;
            const overId = over.id as number;

            // Call server action to swap times
            await swapSessionTimes(activeId, overId);
        }
    }

    // Actions
    async function handleAddDay(newDate: string) {
        const newSettings = {
            ...settings,
            days: [...days, newDate].sort()
        };
        await updateScheduleSettings(schedule.id, newSettings);
        setActiveTab(newDate);
    }

    async function handleUpdateDay(newDate: string) {
        if (!editingDay) return;

        // Move sessions first
        await moveSessionsToNewDate(schedule.id, editingDay, newDate);

        const newSettings = {
            ...settings,
            days: days.map(d => d === editingDay ? newDate : d).sort()
        };
        await updateScheduleSettings(schedule.id, newSettings);
        setActiveTab(newDate);
        setEditingDay(null);
    }

    async function handleAddRoom() {
        const roomName = prompt("Enter room name:");
        if (roomName && !rooms.includes(roomName)) {
            const newSettings = {
                ...settings,
                rooms: [...rooms, roomName]
            };
            await updateScheduleSettings(schedule.id, newSettings);
            setTargetRoom(roomName);
        }
    }

    async function handleRemoveDay(dateToRemove: string) {
        if (confirm(`Remove Day ${dateToRemove}? Sessions on this day will remain but won't be visible in this tab.`)) {
            const newSettings = {
                ...settings,
                days: days.filter(d => d !== dateToRemove)
            };
            await updateScheduleSettings(schedule.id, newSettings);
            if (activeTab === dateToRemove) {
                setActiveTab(newSettings.days[0] || "");
            }
        }
    }

    async function handleRemoveRoom(roomToRemove: string) {
        if (confirm(`Remove Room ${roomToRemove}? Sessions in this room will remain but won't be visible in this list.`)) {
            const newSettings = {
                ...settings,
                rooms: rooms.filter(r => r !== roomToRemove)
            };
            await updateScheduleSettings(schedule.id, newSettings);
            if (targetRoom === roomToRemove) {
                setTargetRoom(newSettings.rooms[0] || undefined);
            }
        }
    }

    async function handleRenameRoom(oldName: string) {
        const newName = prompt("Enter new room name:", oldName);
        if (newName && newName !== oldName) {
            if (rooms.includes(newName)) {
                alert('A room with this name already exists.');
                return;
            }
            await renameRoom(schedule.id, oldName, newName);
            if (targetRoom === oldName) {
                setTargetRoom(newName);
            }
        }
    }

    async function handleDeleteSession(id: number) {
        if (confirm('Are you sure you want to delete this session?')) {
            await deleteSession(id);
            router.refresh();
        }
    }

    function handleEditSession(session: Session) {
        setEditingSession(session);
    }

    function handleExportCSV() {
        const exportData = sessions.map(s => ({
            date: format(new Date(s.start_time), 'yyyy-MM-dd'),
            start_time: format(new Date(s.start_time), 'HH:mm'),
            end_time: format(new Date(s.end_time), 'HH:mm'),
            room: s.room || '',
            type: SESSION_TYPES.find(t => t.value === s.type)?.label || s.type,
            title: s.title,
            chair: s.chair ? `${s.chair.first_name} ${s.chair.last_name}` : '',
            speakers: s.speakers.map(sp => `${sp.first_name} ${sp.last_name}`).join('; '),
            description: s.description || '',
        }));

        const csv = toCSV(exportData, SCHEDULE_CSV_COLUMNS);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `schedule-${schedule.id}-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/conference/schedule">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100/80">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{schedule.title}</h2>
                        <p className="text-sm text-slate-500">{schedule.description || 'Manage your event schedule, days, rooms, and sessions.'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExportCSV} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={() => setIsDayFormOpen(true)}>
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Add Day
                    </Button>
                    <Button variant="outline" onClick={handleAddRoom}>
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        Add Room
                    </Button>
                </div>
            </div>

            {days.length === 0 ? (
                <div className="text-center py-20 border rounded-xl bg-slate-50 text-slate-500 border-dashed">
                    <Calendar className="mx-auto h-12 w-12 mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Setup Required</h3>
                    <p className="mb-6 max-w-md mx-auto">To start building your schedule, please add at least one day and one room.</p>
                    <div className="flex justify-center gap-3">
                        <Button onClick={() => setIsDayFormOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Day
                        </Button>
                        <Button variant="outline" onClick={handleAddRoom}>
                            <LayoutGrid className="mr-2 h-4 w-4" />
                            Add Room
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Level 1: Horizontal Tabs (Dates) - Matching Public UI */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex justify-center mb-8">
                            <TabsList className="h-auto p-1.5 bg-slate-100 rounded-[5px] border border-slate-200 shadow-sm gap-1">
                                {days.map((date, index) => (
                                    <div key={date} className="relative group">
                                        <TabsTrigger
                                            value={date}
                                            className="px-8 py-3 rounded-[5px] text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all text-slate-500 hover:text-slate-700 group-hover:pr-10"
                                        >
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="font-bold text-base">Day {index + 1}</span>
                                                <span className="text-xs font-normal opacity-80">
                                                    {format(new Date(date), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </TabsTrigger>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded-full transition-opacity z-10"
                                                >
                                                    <MoreVertical className="h-3 w-3 text-slate-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuItem onClick={() => setEditingDay(date)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit Date
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleRemoveDay(date)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Remove Day
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </TabsList>
                        </div>
                    </Tabs>

                    {/* Level 2: Layout with Sidebar (Rooms) */}
                    <div className="bg-white rounded-[5px] shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row items-stretch">

                        {/* Left Sidebar: Vertical Rooms */}
                        <div className="w-full md:w-[260px] md:min-w-[260px] bg-slate-50/80 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
                            <div className="p-6 pb-2">
                                <div className="flex items-center gap-2 mb-4 text-slate-400 font-medium">
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Select Room</span>
                                </div>

                                {rooms.length > 0 ? (
                                    <div className="space-y-1">
                                        {rooms.map(room => (
                                            <div key={room} className="relative group">
                                                <button
                                                    onClick={() => setTargetRoom(room)}
                                                    className={`w-full text-left px-4 py-3 rounded-[5px] transition-all duration-200 flex items-center justify-between group ${targetRoom === room
                                                        ? 'bg-primary text-primary-foreground shadow-md'
                                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                                                        }`}
                                                >
                                                    <span className={`text-sm font-medium ${targetRoom === room ? 'text-white' : ''}`}>
                                                        {room}
                                                    </span>
                                                    {targetRoom === room && <MapPin className="h-4 w-4 opacity-80" />}
                                                </button>

                                                {/* Room Actions */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`absolute right-1 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ${targetRoom === room ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-slate-200'}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreVertical className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRenameRoom(room); }}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Rename Room
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); handleRemoveRoom(room); }}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Room
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                        <p className="text-xs text-slate-500 mb-2">No rooms configured.</p>
                                        <Button size="sm" variant="outline" onClick={handleAddRoom} className="w-full">
                                            Add Room
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto p-4 border-t border-slate-200">
                                <Button variant="outline" className="w-full justify-start text-slate-600" onClick={handleAddRoom}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Room
                                </Button>
                            </div>
                        </div>

                        {/* Main Content: Session List (With DnD) */}
                        <div className="flex-1 bg-white flex flex-col min-w-0">
                            {targetRoom ? (
                                <>
                                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 glass">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                <span className="bg-primary/10 text-primary p-1.5 rounded-[5px]"><MapPin className="h-4 w-4" /></span>
                                                {targetRoom}
                                            </h2>
                                            <p className="text-slate-500 text-xs font-medium mt-1 ml-1">
                                                {activeTab ? format(new Date(activeTab), 'EEEE, MMMM d, yyyy') : ''}
                                            </p>
                                        </div>
                                        <Button onClick={() => {
                                            // Only allow adding if we have date and room
                                            if (activeTab && targetRoom) {
                                                setTargetDate(activeTab);
                                                setTargetRoom(targetRoom);
                                                setIsCreateSessionOpen(true);
                                            }
                                        }} size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Session
                                        </Button>
                                    </div>

                                    <div className="p-8 space-y-4 flex-1 overflow-y-auto">
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                            <SortableContext items={filteredSessions.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                                {filteredSessions.length > 0 ? (
                                                    filteredSessions.map(session => (
                                                        <SortableSessionItem key={session.id} session={session} onDelete={handleDeleteSession} onEdit={handleEditSession} />
                                                    ))
                                                ) : (
                                                    <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[5px] bg-slate-50/30">
                                                        <Clock className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                                                        <h3 className="text-sm font-medium text-slate-600">No sessions yet</h3>
                                                        <p className="text-xs text-slate-400 mb-4 max-w-[200px] mx-auto">
                                                            There are no sessions scheduled for this room on this day.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                if (activeTab && targetRoom) {
                                                                    setTargetDate(activeTab);
                                                                    setTargetRoom(targetRoom);
                                                                    setIsCreateSessionOpen(true);
                                                                }
                                                            }}
                                                        >
                                                            Add First Session
                                                        </Button>
                                                    </div>
                                                )}
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 p-8 text-slate-400">
                                    <LayoutTemplate className="h-16 w-16 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Select a room to view sessions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Forms Dialogs (Unchanged mostly) */}
            <Dialog open={isDayFormOpen || !!editingDay} onOpenChange={(open) => {
                if (!open) {
                    setIsDayFormOpen(false);
                    setEditingDay(null);
                }
            }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{editingDay ? 'Edit Day' : 'Add New Day'}</DialogTitle>
                        <DialogDescription>
                            Select the date for this schedule day.
                        </DialogDescription>
                    </DialogHeader>
                    <DayForm
                        date={editingDay || undefined}
                        existingDays={days}
                        onSubmit={editingDay ? handleUpdateDay : handleAddDay}
                        onClose={() => {
                            setIsDayFormOpen(false);
                            setEditingDay(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isCreateSessionOpen || !!editingSession} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateSessionOpen(false);
                    setEditingSession(null);
                    setTargetDate(undefined);
                    // Do NOT reset targetRoom here, so user stays in same room context
                }
            }}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSession ? 'Edit Session' : 'Add New Session'}</DialogTitle>
                        <DialogDescription>
                            {editingSession ? 'Update session details.' : `Create a session for ${targetRoom} on ${targetDate ? format(new Date(targetDate), 'MMM d') : ''}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <SessionForm
                        session={editingSession}
                        scheduleId={schedule.id}
                        defaultDate={targetDate}
                        defaultRoom={targetRoom}
                        allSpeakers={allSpeakers}
                        onClose={() => {
                            setIsCreateSessionOpen(false);
                            setEditingSession(null);
                            setTargetDate(undefined);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
