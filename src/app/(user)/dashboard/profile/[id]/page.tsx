import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getActiveQuestionnaires } from '@/app/actions/questions';
import { getAvailableEvents } from '@/app/actions/events';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Ticket, ClipboardList, CheckCircle2, FileCheck } from "lucide-react";
import Link from 'next/link';
import { ProfileTabs } from './profile-tabs';
import type { Paper } from '@/app/actions/papers';

export const dynamic = 'force-dynamic';

async function getUser(id: number) {
    try {
        const rows = await query('SELECT * FROM users WHERE id = ?', [id]) as any[];
        return rows[0] ?? null;
    } catch {
        return null;
    }
}

async function getRegistrations(userId: number) {
    try {
        return await query(`
            SELECT r.*, t.name as ticket_name, t.event_id,
                   e.name_en as event_name,
                   e.start_date, t.background_image as ticket_background_image
            FROM registrations r
            JOIN tickets t ON r.ticket_id = t.id
            JOIN events e ON t.event_id = e.id
            WHERE r.user_id = ? AND r.status != 'cancelled'
            ORDER BY r.registered_at DESC
        `, [userId]) as any[];
    } catch {
        return [];
    }
}

async function getPapers(userId: number): Promise<Paper[]> {
    try {
        return await query(`
            SELECT p.id, p.title, p.abstract, p.status, p.track_id, p.submitter_id,
                   p.submitted_at, p.decision_at, p.created_at, p.updated_at,
                   t.name as track_name
            FROM papers p
            LEFT JOIN tracks t ON p.track_id = t.id
            WHERE p.submitter_id = ?
            ORDER BY p.created_at DESC
        `, [userId]) as Paper[];
    } catch {
        return [];
    }
}

const VALID_TABS = ['profile', 'conference', 'papers', 'surveys'] as const;
type TabId = typeof VALID_TABS[number];

export default async function UserProfilePage({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { tab?: string };
}) {
    const session = await getSession();

    if (!session) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Login</h1>
                <Link href="/login" className="text-blue-600 hover:underline">Go to Login Page</Link>
            </div>
        );
    }

    const resolvedParams = await Promise.resolve(params);
    const resolvedSearch = await Promise.resolve(searchParams);
    const targetUserId = parseInt(resolvedParams?.id ?? '0');
    const defaultTab = (VALID_TABS as readonly string[]).includes(resolvedSearch?.tab ?? '')
        ? resolvedSearch.tab as TabId
        : 'profile';
    const sessionUserId = Number(session.userId);

    if (!targetUserId) return <div>Error: No User ID provided</div>;

    const isOwnProfile = targetUserId === sessionUserId;
    const isAdmin = session.role === 'admin';
    const canView = isOwnProfile || isAdmin;
    const canEdit = isOwnProfile || isAdmin;

    if (!canView) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to view this profile.
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Link href={`/dashboard/profile/${sessionUserId}`}>
                        <Button variant="outline">Go to My Profile</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch all data in parallel
    const [user, registrations, papers, surveys, availableEvents] = await Promise.all([
        getUser(targetUserId),
        getRegistrations(targetUserId),
        getPapers(targetUserId),
        getActiveQuestionnaires(undefined, targetUserId) as Promise<any[]>,
        getAvailableEvents() as Promise<any[]>,
    ]);

    if (!user) {
        return (
            <div className="p-6 max-w-4xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-slate-900">User Not Found</h1>
                <p className="text-slate-500 mt-2">The user with ID {targetUserId} does not exist.</p>
            </div>
        );
    }

    // Compute hero stats
    const submittedPapers = papers.filter(p => p.status !== 'draft').length;
    const acceptedPapers = papers.filter(p => p.status === 'accepted').length;
    const pendingSurveys = surveys.filter((s: any) => !s.is_completed).length;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Hero Section */}
            <div className="relative rounded-[0.2rem] overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-200 bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="px-8 pt-8 pb-0 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500" />
                            <Avatar className="h-28 w-28 border-[4px] border-white/10 shadow-2xl relative bg-slate-800">
                                <AvatarImage src={user.profile_image || undefined} className="object-cover" />
                                <AvatarFallback className="text-3xl font-bold text-white bg-slate-800">
                                    {user.first_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-1 right-1 h-4 w-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                        </div>

                        {/* Name & Actions */}
                        <div className="flex-1 flex flex-col gap-3 w-full text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                <div className="space-y-1.5">
                                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                        <span className="opacity-75 font-medium mr-2 text-xl">{user.title}</span>
                                        {user.first_name} {user.last_name}
                                    </h1>
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                                        <Badge variant="outline" className="border-white/20 text-blue-200 bg-white/5 capitalize text-xs">
                                            {user.role}
                                        </Badge>
                                        {user.institution && (
                                            <span className="text-sm text-blue-200/60">{user.institution}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center gap-2 shrink-0 justify-center md:justify-end">
                                    {!isOwnProfile && isAdmin && (
                                        <Badge variant="outline" className="bg-amber-900/30 text-amber-200 border-amber-700/50 rounded-[0.2rem]">
                                            Admin View
                                        </Badge>
                                    )}
                                    {isOwnProfile && ['reviewer', 'chair', 'admin'].includes(session.role) && (
                                        <Button variant="outline" asChild className="rounded-[0.2rem] border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white h-8 text-xs">
                                            <Link href="/reviewer/assignments">
                                                <FileCheck className="h-3 w-3 mr-1.5" />
                                                Review
                                            </Link>
                                        </Button>
                                    )}
                                    <Button variant="outline" asChild className="hidden sm:inline-flex rounded-[0.2rem] border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white h-8 text-xs">
                                        <a href={`/profile/${user.id}`} target="_blank" rel="noopener noreferrer">
                                            Public View
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            {/* Stats Bar */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-px mt-2 border-t border-white/10 pt-4 pb-5">
                                {[
                                    { icon: FileText,     label: 'Papers Submitted', value: submittedPapers },
                                    { icon: CheckCircle2, label: 'Accepted',          value: acceptedPapers },
                                    { icon: Ticket,       label: 'Conferences',       value: registrations.length },
                                    { icon: ClipboardList,label: 'Surveys Pending',   value: pendingSurveys,
                                      highlight: pendingSurveys > 0 },
                                ].map(({ icon: Icon, label, value, highlight }) => (
                                    <div key={label} className="flex items-center gap-2 px-5 py-2 border-r border-white/10 last:border-r-0">
                                        <Icon className={`h-4 w-4 ${highlight ? 'text-orange-400' : 'text-blue-300'}`} />
                                        <div>
                                            <p className={`text-lg font-bold leading-none ${highlight ? 'text-orange-300' : 'text-white'}`}>
                                                {value}
                                            </p>
                                            <p className="text-xs text-blue-200/60 mt-0.5">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab-based Content */}
            <ProfileTabs
                user={user}
                registrations={registrations}
                papers={papers}
                surveys={surveys}
                availableEvents={availableEvents}
                canEdit={canEdit}
                isOwnProfile={isOwnProfile}
                defaultTab={defaultTab}
            />
        </div>
    );
}
