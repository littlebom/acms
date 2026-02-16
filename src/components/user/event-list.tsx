'use client';

import { useState } from 'react';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

interface EventData {
    id: number;
    title: string;
    description: string | null;
    venue_name: string | null;
    start_date: Date | null;
    end_date: Date | null;
    registration_deadline: Date | null;
    is_active: boolean;
}

export function EventList({ events }: { events: EventData[] }) {
    if (events.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 text-lg">No events currently available for registration.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => (
                <Card key={event.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                            <CardTitle className="text-xl line-clamp-2 leading-tight">
                                {event.title}
                            </CardTitle>
                            {/* Status Badge logic could go here if needed, e.g. "Closing Soon" */}
                        </div>

                    </CardHeader>

                    <CardContent className="flex-1 space-y-4">
                        <div className="space-y-2 text-sm text-slate-600">
                            {event.start_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span>
                                        {new Date(event.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                    </span>
                                </div>
                            )}
                            {event.venue_name && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span className="line-clamp-1">{event.venue_name}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="pt-4 border-t bg-slate-50/50">
                        <Button asChild className="w-full bg-blue-900 hover:bg-blue-800">
                            <Link href={`/register-conference/${event.id}`}>
                                View Details & Register
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
