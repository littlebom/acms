'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, Paperclip, CalendarDays, LayoutTemplate, Download, ArrowRight } from 'lucide-react';
import { type Session, type Schedule, type ScheduleSettings } from "@/app/actions/schedule";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

const SESSION_TYPES = [
    { value: 'keynote', label: 'Keynote', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { value: 'panel', label: 'Panel Discussion', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'workshop', label: 'Workshop', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    { value: 'presentation', label: 'Paper Presentation', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 'break', label: 'Break', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

export function ScheduleViewer({
    schedule,
    sessions,
    limit,
    showAllLink
}: {
    schedule: Schedule,
    sessions: Session[],
    limit?: number,
    showAllLink?: string
}) {
    const [activeDate, setActiveDate] = useState<string>("");
    const [activeRoom, setActiveRoom] = useState<string>("");

    // Parse settings
    const settings: ScheduleSettings = typeof schedule.settings === 'string'
        ? JSON.parse(schedule.settings)
        : (schedule.settings || { days: [], rooms: [] });

    const days = settings.days || [];
    const rooms = settings.rooms || [];

    // Initialize Active Date
    useEffect(() => {
        if (activeDate === "" && days.length > 0) {
            setActiveDate(days[0]);
        }
    }, [days, activeDate]);

    // Group sessions by Date and Room for easy filters
    // Actually we will filter on the fly or just memoize a bit
    const filteredSessions = useMemo(() => {
        if (!activeDate || !activeRoom) return [];

        return sessions.filter(s => {
            const dateMatch = format(new Date(s.start_time), 'yyyy-MM-dd') === activeDate;
            const roomMatch = s.room === activeRoom;
            return dateMatch && roomMatch;
        }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    }, [sessions, activeDate, activeRoom]);

    // Check availability (which rooms have sessions on activeDate?)
    const availableRoomsForDate = useMemo(() => {
        if (!activeDate) return [];
        const roomsWithSessions = new Set<string>();
        sessions.forEach(s => {
            if (format(new Date(s.start_time), 'yyyy-MM-dd') === activeDate && s.room) {
                roomsWithSessions.add(s.room);
            }
        });
        // Return rooms from settings that actually have sessions, preserving order
        // return rooms.filter(r => roomsWithSessions.has(r));
        // Or should we just show all rooms? User said "Vertical tabs is Room name", imply selection.
        // Let's show all configured rooms, but maybe dim empty ones?
        // Let's just show all for consistent UI.
        return rooms;
    }, [sessions, activeDate, rooms]);


    // Set first room active when Date changes
    useEffect(() => {
        if (activeDate && availableRoomsForDate.length > 0) {
            // If current activeRoom is not in the new available list (unlikely if rooms consistent), or just reset?
            // Usually nice to keep room if it exists on both days (e.g. "Main Hall")
            // But if we want to ensure valid select:
            if (!activeRoom || !availableRoomsForDate.includes(activeRoom)) {
                setActiveRoom(availableRoomsForDate[0]);
            }
        }
    }, [activeDate, availableRoomsForDate, activeRoom]);


    if (!schedule || days.length === 0) {
        return (
            <div className="text-center py-20 text-slate-500">
                <p className="text-lg">Schedule will be announced soon.</p>
            </div>
        );
    }

    const displaySessions = limit ? filteredSessions.slice(0, limit) : filteredSessions;

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Level 1: Horizontal Tabs (Dates) */}
            <Tabs value={activeDate} onValueChange={setActiveDate} className="w-full mb-8">
                <div className="flex justify-center">
                    <TabsList className="h-auto p-1.5 bg-slate-100 rounded-[5px] border border-slate-200 shadow-sm">
                        {days.map((date, index) => (
                            <TabsTrigger
                                key={date}
                                value={date}
                                className="px-8 py-3 rounded-[5px] text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all text-slate-500 hover:text-slate-700"
                            >
                                <div className="flex flex-col items-center gap-0.5">
                                    <span className="font-bold text-base">Day {index + 1}</span>
                                    <span className="text-xs font-normal opacity-80">
                                        {format(new Date(date), 'MMMM d, yyyy')}
                                    </span>
                                </div>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
            </Tabs>

            {/* Level 2: Content Area with Vertical Sidebar */}
            <div className="bg-white rounded-[5px] shadow-xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">

                {/* Left Sidebar: Vertical Rooms */}
                <div className="w-full md:w-[240px] md:min-w-[240px] bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-200 p-6">
                    <div className="flex items-center gap-2 mb-4 text-slate-400 font-medium px-2">
                        <LayoutTemplate className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Select Room</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {availableRoomsForDate.map(room => (
                            <button
                                key={room}
                                onClick={() => setActiveRoom(room)}
                                className={`w-full text-left px-4 py-3 rounded-[5px] transition-all duration-200 flex items-center justify-between group ${activeRoom === room
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent'
                                    }`}
                            >
                                <span className={`text-sm font-medium ${activeRoom === room ? 'text-white' : 'group-hover:text-primary transition-colors'}`}>
                                    {room}
                                </span>
                                {activeRoom === room && <MapPin className="h-4 w-4 opacity-80" />}
                            </button>
                        ))}

                        {availableRoomsForDate.length === 0 && (
                            <div className="text-sm text-slate-400 italic px-2">No rooms configured.</div>
                        )}
                    </div>
                </div>

                {/* Right Content: Session List */}
                <div className="flex-1 p-8 bg-white flex flex-col">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-secondary/10 text-secondary-foreground p-1.5 rounded-[5px]"><MapPin className="h-4 w-4" /></span>
                                {activeRoom}
                            </h2>
                            <p className="text-slate-500 text-xs font-medium mt-1 ml-1">
                                {filteredSessions.length} sessions scheduled
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-primary bg-primary/5 px-3 py-1 rounded-full">
                                {activeDate ? format(new Date(activeDate), 'EEEE, MMMM d, yyyy') : ''}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        {displaySessions.length > 0 ? (
                            <>
                                {displaySessions.map(session => (
                                    <div
                                        key={session.id}
                                        className="group relative bg-white border border-slate-100 rounded-[5px] p-6 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row gap-6">
                                            {/* Left Column: Speakers (if any) */}
                                            {session.speakers && session.speakers.length > 0 && (
                                                <div className="md:w-48 flex-shrink-0 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-50 pb-4 md:pb-0 md:pr-6">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Speakers</span>
                                                    <div className="flex flex-col gap-3">
                                                        {session.speakers.map(speaker => (
                                                            <div key={speaker.id} className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                                    <AvatarImage src={speaker.profile_image || undefined} className="object-cover object-top" />
                                                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                                        {speaker.first_name[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{speaker.first_name} {speaker.last_name}</p>
                                                                    <p className="text-xs text-slate-500 truncate mt-0.5">Speaker</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Right/Main Column: Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Time and Type */}
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <Badge variant="outline" className={`${SESSION_TYPES.find(t => t.value === session.type)?.color || 'bg-slate-50 text-slate-600'} border-0 px-2.5 py-0.5 rounded-[4px] text-xs font-medium`}>
                                                        {SESSION_TYPES.find(t => t.value === session.type)?.label}
                                                    </Badge>
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {format(new Date(session.start_time), 'HH:mm')} - {format(new Date(session.end_time), 'HH:mm')}
                                                    </div>
                                                </div>

                                                {/* Title & Desc */}
                                                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors leading-snug">
                                                    {session.title}
                                                </h3>
                                                {session.description && (
                                                    <p className="text-slate-600 text-sm mb-4 leading-relaxed line-clamp-2">
                                                        {session.description}
                                                    </p>
                                                )}

                                                {/* Attachments */}
                                                {session.attachments && session.attachments.length > 0 && (
                                                    <div className="pt-4 mt-auto border-t border-slate-50">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Resources</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {session.attachments.map(file => (
                                                                <Button key={file.id} variant="outline" size="sm" className="h-8 gap-2 bg-slate-50 border-slate-200 hover:bg-white hover:border-primary/50 text-slate-600 hover:text-primary rounded-[5px]" asChild>
                                                                    <a href={file.file_url} target="_blank" rel="noreferrer">
                                                                        <Download className="h-3.5 w-3.5" />
                                                                        {file.file_name}
                                                                    </a>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Column: Chair */}
                                            {session.chair && (
                                                <div className="md:w-48 flex-shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chair</span>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                            <AvatarImage src={session.chair.profile_image || undefined} className="object-cover object-top" />
                                                            <AvatarFallback className="bg-purple-50 text-purple-700 font-bold">
                                                                {session.chair.first_name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{session.chair.first_name} {session.chair.last_name}</p>
                                                            <p className="text-xs text-[#0ac5b2] truncate mt-0.5">Session Chair</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {showAllLink && (
                                    <div className="flex justify-center pt-6">
                                        <Button asChild variant="outline" className="gap-2">
                                            <Link href={showAllLink}>
                                                View Complete Schedule
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20 bg-slate-50/50 rounded-[5px] border-2 border-dashed border-slate-200">
                                <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-slate-600">No sessions scheduled</h3>
                                <p className="text-slate-400">There are no sessions in this room for the selected date.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
