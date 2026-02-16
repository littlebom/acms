'use client';

import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { setAdminEventId } from '@/lib/admin-event';
import { useRouter } from 'next/navigation';

interface EventSummary {
    id: number;
    title: string;
    is_active: boolean;
    slug: string;
    start_date: Date | null;
}

interface EventSwitcherProps {
    events: EventSummary[];
    selectedId: number;
}

export function EventSwitcher({ events, selectedId }: EventSwitcherProps) {
    const router = useRouter();
    const [isPending, startTransition] = React.useTransition();

    const handleChange = (value: string) => {
        const id = parseInt(value);
        startTransition(async () => {
            await setAdminEventId(id);
            router.refresh(); // Client-side refresh to update view
        });
    };

    // Find selected event to show extra info if needed (like "Historical")
    const selectedEvent = events.find(e => e.id === selectedId);
    const isHistorical = selectedEvent && !selectedEvent.is_active;

    return (
        <div className="w-full mb-4">
            {isHistorical && (
                <div className="mb-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded border border-yellow-200 flex items-center gap-2">
                    <span className="text-sm">⚠️</span>
                    Viewing Historical Data
                </div>
            )}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                    Select Event Scope
                </label>
                <Select
                    value={selectedId.toString()}
                    onValueChange={handleChange}
                    disabled={isPending}
                >
                    <SelectTrigger className={`w-full ${isHistorical ? 'border-yellow-400 bg-yellow-50' : ''}`}>
                        <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent>
                        {events.map((event) => (
                            <SelectItem key={event.id} value={event.id.toString()}>
                                <span className={event.is_active ? 'font-bold' : ''}>
                                    {event.title}
                                </span>
                                {event.is_active && (
                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                        Active
                                    </span>
                                )}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
