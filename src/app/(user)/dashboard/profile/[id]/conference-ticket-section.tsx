'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Eye, X } from "lucide-react";
import Link from 'next/link';
import { cancelRegistration } from '@/app/actions/user-registration';
import { BadgeCard } from "@/components/user/badge-card";

interface Registration {
    id: number;
    event_id: number;
    event_name: string;
    ticket_name: string;
    status: string;
    start_date?: string;
    ticket_background_image?: string;
}

interface User {
    first_name: string;
    last_name: string;
    email: string;
    title?: string;
    institution?: string;
    organization?: string;
    profile_image?: string | null;
}

interface ConferenceTicketSectionProps {
    registrations: Registration[];
    user: User;
}

export function ConferenceTicketSection({ registrations, user }: ConferenceTicketSectionProps) {
    const router = useRouter();
    const [badgeTarget, setBadgeTarget] = useState<Registration | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Registration | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleConfirmCancel() {
        if (!cancelTarget) return;
        setLoading(true);
        await cancelRegistration(cancelTarget.id);
        setLoading(false);
        setCancelTarget(null);
        router.refresh();
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                {registrations.map((reg) => (
                    <div key={reg.id} className="relative bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                        {/* Decorative Left Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${reg.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                        <div className="p-4 pl-6 flex flex-col gap-3">
                            {/* Header: Event name & Status */}
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {reg.ticket_name}
                                </div>
                                {reg.start_date && (
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <span>•</span>
                                        <span>
                                            {new Date(reg.start_date).toLocaleDateString('en-US', {
                                                month: 'long', day: 'numeric', year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-1">
                                <Button asChild className="flex-1 bg-slate-900 text-white hover:bg-slate-800 rounded-[0.2rem] h-9 text-sm shadow-sm">
                                    <Link href={`/register-conference/${reg.event_id}`}>
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        View Detail
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-[0.2rem] h-9 text-sm border-slate-200 text-slate-700 hover:bg-slate-50"
                                    onClick={() => setBadgeTarget(reg)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Badge
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-[0.2rem] border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 shrink-0"
                                    onClick={() => setCancelTarget(reg)}
                                    title="Cancel Registration"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Badge Preview Dialog */}
            <Dialog open={!!badgeTarget} onOpenChange={(open) => !open && setBadgeTarget(null)}>
                <DialogContent className="sm:max-w-md flex justify-center bg-slate-50">
                    <DialogTitle className="sr-only">Badge Preview</DialogTitle>
                    {badgeTarget && (
                        <div className="py-4">
                            <BadgeCard
                                user={{
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    email: user.email,
                                    organization: user.institution || user.organization || 'Attendee',
                                    title: user.title,
                                    profile_image: user.profile_image,
                                }}
                                event={{
                                    name: badgeTarget.event_name,
                                    date: badgeTarget.start_date
                                        ? new Date(badgeTarget.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'Date TBD',
                                    venue: '',
                                }}
                                ticketType={badgeTarget.ticket_name}
                                registrationId={`#${badgeTarget.id.toString().padStart(6, '0')}`}
                                backgroundImage={badgeTarget.ticket_background_image}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Cancel Registration?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your registration for{' '}
                            <span className="font-semibold text-slate-900">{cancelTarget?.event_name}</span>?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setCancelTarget(null)}
                            disabled={loading}
                        >
                            Keep Registration
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmCancel}
                            disabled={loading}
                        >
                            {loading ? 'Cancelling…' : 'Yes, Cancel'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
