'use client';

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from 'next/link';
import { BadgeCard } from "@/components/user/badge-card";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";

interface Registration {
    id: number;
    event_name: string;
    ticket_name: string;
    status: string;
    start_date?: string;
    ticket_background_image?: string;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    title?: string;
    organization?: string;
    institution?: string;
}

interface ConferenceTicketSectionProps {
    registrations: Registration[];
    user: User;
}

export function ConferenceTicketSection({ registrations, user }: ConferenceTicketSectionProps) {
    const [previewBadge, setPreviewBadge] = useState<Registration | null>(null);

    return (
        <div className="flex flex-col gap-4">
            {registrations.length > 0 ? (
                registrations.map((reg) => (
                    <div key={reg.id} className="relative bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                        {/* Decorative Left Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${reg.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                        <div className="p-4 pl-6 flex flex-col gap-3">
                            {/* Header: Badge & Status */}
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        Conference Event
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                        {reg.event_name}
                                    </h3>
                                </div>
                                <Badge className={`shrink-0 rounded-[0.2rem] px-2 py-0.5 text-xs font-semibold ${reg.status === 'paid'
                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200"
                                        : "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                                    }`}>
                                    {reg.status === 'paid' ? 'Confirmed' : 'Pending'}
                                </Badge>
                            </div>

                            {/* Details: Ticket & Date */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 border-t border-dashed border-slate-100 pt-3">
                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-slate-700 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {reg.ticket_name}
                                </div>
                                {reg.start_date && (
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <span>•</span>
                                        <span>{new Date(reg.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <Button
                                onClick={() => setPreviewBadge(reg)}
                                className="w-full bg-slate-900 text-white hover:bg-blue-900 rounded-[0.2rem] h-9 text-sm shadow-sm mt-1 transition-colors"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview Badge
                            </Button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                    No active registrations found.
                </div>
            )}



            {/* Helper Dialog for Badge Preview */}
            <Dialog open={!!previewBadge} onOpenChange={(open) => !open && setPreviewBadge(null)}>
                <DialogContent className="sm:max-w-md flex justify-center bg-slate-50">
                    <DialogTitle className="sr-only">Badge Preview</DialogTitle>
                    {previewBadge && (
                        <div className="py-4">
                            <BadgeCard
                                user={{
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    email: user.email,
                                    organization: user.institution || user.organization || 'Attendee',
                                    title: user.title
                                }}
                                event={{
                                    name: previewBadge.event_name,
                                    date: previewBadge.start_date ? new Date(previewBadge.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD',
                                    venue: '' // Venue removed from display
                                }}
                                ticketType={previewBadge.ticket_name}
                                registrationId={`#${previewBadge.id.toString().padStart(6, '0')}`}
                                backgroundImage={previewBadge.ticket_background_image}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
