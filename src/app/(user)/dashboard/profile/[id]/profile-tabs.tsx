'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    User, Ticket, FileText, ClipboardList,
    Mail, Phone, MapPin, Globe, Building2, GraduationCap,
    Briefcase, Award, Pencil, Plus, CheckCircle, ArrowRight,
    Send, Edit3, Clock, AlertCircle, CheckCircle2, XCircle, Eye,
} from 'lucide-react';
import { ConferenceTicketSection } from './conference-ticket-section';
import type { Paper, PaperStatus } from '@/app/actions/papers';

// ─── Paper Status Config ───────────────────────────────────────────────────
const STATUS_CONFIG: Record<PaperStatus, { label: string; color: string; icon: React.ElementType }> = {
    draft:              { label: 'Draft',              color: 'bg-slate-100 text-slate-700',    icon: Edit3       },
    submitted:          { label: 'Submitted',          color: 'bg-blue-100 text-blue-700',      icon: Send        },
    under_review:       { label: 'Under Review',       color: 'bg-purple-100 text-purple-700',  icon: Clock       },
    revision_required:  { label: 'Revision Required',  color: 'bg-amber-100 text-amber-700',    icon: AlertCircle },
    revision_submitted: { label: 'Revision Submitted', color: 'bg-indigo-100 text-indigo-700',  icon: Send        },
    accepted:           { label: 'Accepted',           color: 'bg-emerald-100 text-emerald-700',icon: CheckCircle2},
    rejected:           { label: 'Rejected',           color: 'bg-red-100 text-red-700',        icon: XCircle     },
    camera_ready:       { label: 'Camera Ready',       color: 'bg-teal-100 text-teal-700',      icon: FileText    },
    published:          { label: 'Published',          color: 'bg-green-100 text-green-700',    icon: CheckCircle2},
};

// ─── Types ─────────────────────────────────────────────────────────────────
type TabId = 'profile' | 'conference' | 'papers' | 'surveys';

interface ProfileTabsProps {
    user: any;
    registrations: any[];
    papers: Paper[];
    surveys: any[];
    availableEvents: any[];
    canEdit: boolean;
    isOwnProfile: boolean;
    defaultTab?: TabId;
    showSubmissions?: boolean;
}

// ─── Main Tabs Component ───────────────────────────────────────────────────
export function ProfileTabs({
    user, registrations, papers, surveys, availableEvents, canEdit, isOwnProfile, defaultTab = 'profile', showSubmissions = true,
}: ProfileTabsProps) {
    // If default tab is papers but submissions hidden, fallback to profile
    const safeDefault = (!showSubmissions && defaultTab === 'papers') ? 'profile' : defaultTab;
    const [activeTab, setActiveTab] = useState<TabId>(safeDefault);

    const pendingSurveys = surveys.filter((s: any) => !s.is_completed).length;

    const tabs: { id: TabId; label: string; Icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
        { id: 'profile',    label: 'Profile',    Icon: User },
        { id: 'conference', label: 'Conference',  Icon: Ticket,       badge: registrations.length || undefined },
        ...(showSubmissions ? [{ id: 'papers' as TabId, label: 'Submissions', Icon: FileText, badge: papers.length || undefined }] : []),
        { id: 'surveys',    label: 'Surveys',     Icon: ClipboardList, badge: pendingSurveys || undefined, badgeColor: 'bg-orange-100 text-orange-700' },
    ];

    return (
        <div>
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
                {tabs.map(({ id, label, Icon, badge, badgeColor }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                            activeTab === id
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                        {badge !== undefined && badge > 0 && (
                            <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${badgeColor ?? 'bg-slate-100 text-slate-600'}`}>
                                {badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'profile'    && <ProfileTab user={user} canEdit={canEdit} />}
            {activeTab === 'conference' && <ConferenceTab registrations={registrations} availableEvents={availableEvents} user={user} isOwnProfile={isOwnProfile} />}
            {activeTab === 'papers'     && <PapersTab papers={papers} isOwnProfile={isOwnProfile} />}
            {activeTab === 'surveys'    && <SurveysTab surveys={surveys} />}
        </div>
    );
}

// ─── Tab 1: Profile ────────────────────────────────────────────────────────
function ProfileTab({ user, canEdit }: { user: any; canEdit: boolean }) {
    return (
        <div className="space-y-6">
            {/* About Me */}
            <Card className="border-slate-200 rounded-[0.2rem]">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-base">
                            <div className="p-1.5 bg-primary/10 text-primary rounded-[0.2rem] border border-primary/20">
                                <User className="h-3.5 w-3.5" />
                            </div>
                            About Me
                        </div>
                        {canEdit && (
                            <Link href={`/dashboard/profile/${user.id}/edit`}>
                                <Button variant="ghost" size="sm" className="text-xs text-slate-500 h-7">
                                    <Pencil className="h-3 w-3 mr-1" /> Edit
                                </Button>
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    {user.bio ? (
                        <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{user.bio}</p>
                    ) : (
                        <div className="text-center py-6 bg-slate-50/50 rounded-[0.2rem] border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm">No biography provided.</p>
                            {canEdit && (
                                <Link href={`/dashboard/profile/${user.id}/edit`}>
                                    <Button variant="link" size="sm" className="text-primary mt-1 text-xs">
                                        <Pencil className="h-3 w-3 mr-1" /> Write your bio
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-slate-200 rounded-[0.2rem]">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                    <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-base">
                        <div className="p-1.5 bg-primary/10 text-primary rounded-[0.2rem] border border-primary/20">
                            <Phone className="h-3.5 w-3.5" />
                        </div>
                        Contact Information
                    </div>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                            <Mail className="h-3 w-3" /> Email
                        </span>
                        <p className="text-sm font-medium text-slate-900 truncate" title={user.email}>{user.email}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                            <Phone className="h-3 w-3" /> Phone
                        </span>
                        <p className="text-sm font-medium text-slate-900">{user.phone_number || '—'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                            <Globe className="h-3 w-3" /> Country
                        </span>
                        <p className="text-sm font-medium text-slate-900">{user.country || '—'}</p>
                    </div>
                    {user.address && (
                        <div className="col-span-full border-t border-slate-100 pt-3 flex items-start gap-2 text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <span className="text-sm">{user.address}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Professional & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="border-slate-200 rounded-[0.2rem]">
                    <CardHeader className="pb-3 border-b border-slate-50 py-3">
                        <CardTitle className="flex items-center gap-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Experience
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <h3 className="text-base font-bold text-slate-900 mb-1">{user.occupation || 'No Position'}</h3>
                        <div className="flex items-center gap-2 text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-[0.2rem] mt-1">
                            <Building2 className="h-3 w-3" />
                            <span className="text-xs font-medium">{user.institution || 'No Organization'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 rounded-[0.2rem]">
                    <CardHeader className="pb-3 border-b border-slate-50 py-3">
                        <CardTitle className="flex items-center gap-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400" /> Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <h3 className="text-base font-bold text-slate-900 mb-1">{user.education_level || 'No Degree'}</h3>
                        <div className="flex items-center gap-2 text-primary bg-primary/5 w-fit px-2 py-0.5 rounded-[0.2rem] mt-1">
                            <Award className="h-3 w-3" />
                            <span className="text-xs font-medium">Academic Background</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Details */}
                <Card className="border-slate-200 rounded-[0.2rem] md:col-span-2">
                    <CardHeader className="pb-3 border-b border-slate-50 py-3">
                        <CardTitle className="flex items-center gap-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">
                            <User className="h-3.5 w-3.5 text-slate-400" /> Personal Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Gender',       value: user.gender },
                            { label: 'Birth Year',   value: user.birth_year },
                            { label: 'Role',         value: user.role },
                            { label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : null },
                        ].map(({ label, value }) => (
                            <div key={label} className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                                <p className="text-sm font-medium text-slate-900">{value || '—'}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ─── Tab 2: Conference ─────────────────────────────────────────────────────
function ConferenceTab({
    registrations, availableEvents, user, isOwnProfile,
}: { registrations: any[]; availableEvents: any[]; user: any; isOwnProfile: boolean }) {
    const registeredEventIds = new Set(registrations.map((r: any) => r.event_id));
    const unregisteredEvents = availableEvents.filter((e: any) => !registeredEventIds.has(e.id));

    const fmt = (d: string | Date | undefined) =>
        d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

    return (
        <div className="space-y-8">
            {/* ── Registered Conferences ── */}
            {registrations.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        My Registrations ({registrations.length})
                    </h3>
                    <ConferenceTicketSection registrations={registrations} user={user} />
                </div>
            )}

            {/* ── Available Conferences ── */}
            {isOwnProfile && unregisteredEvents.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" />
                        Available Conferences ({unregisteredEvents.length})
                    </h3>
                    <div className="flex flex-col gap-4">
                        {unregisteredEvents.map((event: any) => (
                            <div key={event.id} className="relative bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                                <div className="p-4 pl-6 flex flex-col gap-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conference Event</span>
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{event.name_en}</h3>
                                            {event.short_description && (
                                                <p className="text-sm text-slate-500 line-clamp-2">{event.short_description}</p>
                                            )}
                                        </div>
                                        <Badge className="shrink-0 rounded-[0.2rem] px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                                            Open
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 border-t border-dashed border-slate-100 pt-3">
                                        {event.venue_name && (
                                            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded text-slate-700 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {event.venue_name}
                                            </div>
                                        )}
                                        {event.start_date && (
                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                <span>•</span>
                                                <span>{fmt(event.start_date)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button asChild className="w-full bg-primary text-white hover:bg-primary/90 rounded-[0.2rem] h-9 text-sm shadow-sm mt-1">
                                        <Link href={`/register-conference/${event.id}`}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Register
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Empty State ── */}
            {registrations.length === 0 && unregisteredEvents.length === 0 && (
                <div className="text-center py-16 border border-dashed rounded-[0.2rem] bg-slate-50">
                    <Ticket className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                    <h3 className="text-base font-medium text-slate-900">No conferences available</h3>
                    <p className="text-slate-500 text-sm mt-1">Check back later for upcoming conferences.</p>
                </div>
            )}

            {/* ── Registered only, no more to join ── */}
            {registrations.length > 0 && unregisteredEvents.length === 0 && isOwnProfile && (
                <p className="text-center text-sm text-slate-400">No additional conferences available to register.</p>
            )}
        </div>
    );
}

// ─── Tab 3: My Papers ──────────────────────────────────────────────────────
function PapersTab({ papers, isOwnProfile }: { papers: Paper[]; isOwnProfile: boolean }) {
    const fmt = (d: Date | string | undefined) =>
        d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

    return (
        <div className="space-y-4">
            {isOwnProfile && (
                <div className="flex justify-end">
                    <Link href="/submit-paper">
                        <Button className="bg-primary hover:bg-primary/90" size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Submit New Paper
                        </Button>
                    </Link>
                </div>
            )}

            {papers.length === 0 ? (
                <Card className="text-center py-14">
                    <CardContent>
                        <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="text-base font-semibold text-slate-700 mb-1">No Submissions Yet</h3>
                        <p className="text-slate-500 text-sm mb-4">Start by submitting your first paper.</p>
                        {isOwnProfile && (
                            <Button asChild className="bg-primary hover:bg-primary/90" size="sm">
                                <Link href="/submit-paper">Submit Your First Paper</Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                papers.map((paper) => {
                    const cfg = STATUS_CONFIG[paper.status];
                    const StatusIcon = cfg.icon;
                    return (
                        <Card key={paper.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <Badge className={`${cfg.color} mb-2`}>
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {cfg.label}
                                        </Badge>
                                        <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2">{paper.title}</h3>
                                        {paper.track_name && (
                                            <p className="text-xs text-slate-500 mb-1">
                                                Track: <span className="font-medium">{paper.track_name}</span>
                                            </p>
                                        )}
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-2">{paper.abstract}</p>
                                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                            {fmt(paper.created_at) && <span>Created: {fmt(paper.created_at)}</span>}
                                            {fmt(paper.submitted_at) && <span>Submitted: {fmt(paper.submitted_at)}</span>}
                                            {fmt(paper.decision_at) && <span>Decision: {fmt(paper.decision_at)}</span>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/my-submissions/${paper.id}`}>
                                                <Eye className="h-4 w-4 mr-1" /> View
                                            </Link>
                                        </Button>
                                        {paper.status === 'revision_required' && (
                                            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
                                                <Link href={`/my-submissions/${paper.id}/revise`}>
                                                    <Send className="h-4 w-4 mr-1" /> Revise
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </div>
    );
}

// ─── Tab 4: Surveys ────────────────────────────────────────────────────────
function SurveysTab({ surveys }: { surveys: any[] }) {
    const categoryLabel = (cat: string) =>
        cat === 'pre-event'  ? 'Registration' :
        cat === 'post-event' ? 'Feedback'     :
        cat === 'research'   ? 'Research'     : 'Survey';

    if (surveys.length === 0) {
        return (
            <div className="text-center py-16 border border-dashed rounded-[0.2rem] bg-slate-50">
                <ClipboardList className="mx-auto h-10 w-10 text-slate-400 mb-3" />
                <h3 className="text-base font-medium text-slate-900">No surveys available</h3>
                <p className="text-slate-500 text-sm mt-1">Check back later for new surveys.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {surveys.map((q: any) => (
                <Card key={q.id} className={`relative transition-all hover:shadow-md rounded-[0.2rem] ${q.is_completed ? 'opacity-75' : ''}`}>
                    {q.is_completed && (
                        <div className="absolute top-3 right-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" /> Completed
                            </Badge>
                        </div>
                    )}
                    <CardHeader className="pb-2">
                        <Badge variant="secondary" className="w-fit mb-2 text-xs">{categoryLabel(q.category)}</Badge>
                        <CardTitle className="line-clamp-2 text-base">{q.title}</CardTitle>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{q.description || 'No description'}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">{q.questions_count || 0} questions</span>
                            {!q.is_completed ? (
                                <Link href={`/dashboard/surveys/${q.id}`}>
                                    <Button size="sm">
                                        Start Survey <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button size="sm" variant="ghost" disabled>Submitted</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
