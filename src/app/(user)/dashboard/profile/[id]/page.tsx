import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Pencil } from "lucide-react";
import Link from 'next/link';
import { ConferenceTicketSection } from './conference-ticket-section';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Mail,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    Calendar,
    Globe,
    User,
    Building2,
    Award,
    Ticket
} from "lucide-react";

async function getUser(id: number) {
    try {
        const users = await query('SELECT * FROM users WHERE id = ?', [id]) as any[];
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

async function getRegistrations(userId: number) {
    try {
        return await query(`
            SELECT r.*, t.name as ticket_name, e.name_en as event_name, e.start_date, t.background_image as ticket_background_image
            FROM registrations r
            JOIN tickets t ON r.ticket_id = t.id
            JOIN events e ON t.event_id = e.id
            WHERE r.user_id = ? AND r.status != 'cancelled'
            ORDER BY r.registered_at DESC
        `, [userId]) as any[];
    } catch (error) {
        console.error("Error fetching registrations:", error);
        return [];
    }
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
    const session = await getSession();

    // 1. Check Login
    if (!session) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Login</h1>
                <Link href="/login" className="text-blue-600 hover:underline">Go to Login Page</Link>
            </div>
        );
    }

    // Handle potential Promise params (Next.js 15) or standard object
    const resolvedParams = await Promise.resolve(params);
    const idString = resolvedParams?.id;

    if (!idString) {
        return <div>Error: No User ID provided</div>;
    }

    const targetUserId = parseInt(idString);
    const sessionUserId = Number(session.userId);

    // 2. Check Permissions
    const isOwnProfile = targetUserId === sessionUserId;
    const isAdmin = session.role === 'admin';
    const canView = isOwnProfile || isAdmin;
    const canEdit = isOwnProfile || isAdmin; // Permission logic for edit button

    if (!canView) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to view this profile.
                        <br />
                        Your ID: {sessionUserId} | Target ID: {targetUserId}
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

    // 3. Fetch Data
    const user = await getUser(targetUserId);
    const registrations = await getRegistrations(targetUserId);

    if (!user) {
        return (
            <div className="p-6 max-w-4xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-slate-900">User Not Found</h1>
                <p className="text-slate-500 mt-2">The user with ID {targetUserId} does not exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. Modern Hero Section */}
            <div className="relative rounded-[0.2rem] overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-200 bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                <div className="px-8 py-10 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                            <Avatar className="h-32 w-32 border-[4px] border-white/10 shadow-2xl relative bg-slate-800">
                                <AvatarImage src={user.profile_image || undefined} className="object-cover" />
                                <AvatarFallback className="text-4xl font-bold text-white bg-slate-800">
                                    {user.first_name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-2 right-2 h-5 w-5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm" title="Active"></div>
                        </div>

                        {/* Name & Actions */}
                        <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full text-center md:text-left">
                            <div className="space-y-2 mb-1">
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                                        <span className="opacity-90 font-semibold mr-2 text-2xl">{user.title}</span>
                                        {user.first_name} {user.last_name}
                                    </h1>
                                </div>
                                <p className="text-base text-blue-200 font-medium flex flex-wrap justify-center md:justify-start items-center gap-2">
                                    <span className="font-medium">Conference Attendee</span>
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 md:mb-1 shrink-0">
                                {!isOwnProfile && isAdmin && (
                                    <Badge variant="outline" className="bg-amber-900/30 text-amber-200 border-amber-700/50 rounded-[0.2rem]">
                                        Admin View
                                    </Badge>
                                )}

                                <Button variant="outline" asChild className="hidden sm:inline-flex rounded-[0.2rem] border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white h-9 text-sm">
                                    <a href={`/profile/${user.id}`} target="_blank" rel="noopener noreferrer">
                                        Public View
                                    </a>
                                </Button>

                                {canEdit && (
                                    <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 hover:text-blue-900 shadow-lg shadow-black/20 rounded-[0.2rem] px-5 h-9 text-sm">
                                        <Link href={`/dashboard/profile/${user.id}/edit`}>
                                            <Pencil className="h-3.5 w-3.5 mr-2" />
                                            Edit Profile
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Personal Details Card */}
                    <Card className="group shadow-sm hover:shadow-md transition-all duration-300 border-slate-200 rounded-[0.2rem]">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-base">
                                <div className="p-1.5 bg-blue-100/50 text-blue-600 rounded-[0.2rem] border border-blue-100">
                                    <User className="h-3.5 w-3.5" />
                                </div>
                                Personal Details
                            </div>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Gender</span>
                                    <p className="text-slate-900 font-medium text-sm">{user.gender || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Born</span>
                                    <p className="text-slate-900 font-medium text-sm">{user.birth_year || '-'}</p>
                                </div>
                                <div className="space-y-1 col-span-2 pt-2 border-t border-slate-50">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Member Since</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        <p className="text-slate-900 font-medium text-sm">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conference Registration Card */}
                    <Card className="group shadow-sm hover:shadow-md transition-all duration-300 border-slate-200 rounded-[0.2rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-base">
                                <div className="p-1.5 bg-blue-100/50 text-blue-600 rounded-[0.2rem] border border-blue-100">
                                    <Ticket className="h-3.5 w-3.5" />
                                </div>
                                Conference Ticket
                            </div>
                        </CardHeader>
                        <CardContent className="p-5">
                            <ConferenceTicketSection registrations={registrations} user={user} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Bio Section */}
                    <Card className="relative shadow-md shadow-blue-100/50 hover:shadow-lg hover:shadow-blue-100/40 transition-all duration-300 border-slate-200 border-t-[4px] border-t-blue-800 rounded-[0.2rem] overflow-visible">
                        <CardHeader className="bg-white pt-5 pb-2">
                            <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-[0.2rem] border border-blue-100 flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                </span>
                                About Me
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-6 pt-2">
                            {user.bio ? (
                                <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap font-sans pl-1">
                                    {user.bio}
                                </p>
                            ) : (
                                <div className="text-center py-8 bg-slate-50/50 rounded-[0.2rem] border border-dashed border-slate-200 mx-1">
                                    <p className="text-slate-400 font-medium text-sm">No biography provided yet.</p>
                                    {canEdit && (
                                        <Button variant="link" className="text-blue-600 mt-1 font-semibold text-sm" asChild>
                                            <Link href={`/dashboard/profile/${user.id}/edit`}>
                                                <Pencil className="h-3 w-3 mr-1.5" />
                                                Write your bio
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Card (Moved from Left) */}
                    <Card className="group shadow-sm hover:shadow-md transition-all duration-300 border-slate-200 rounded-[0.2rem]">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <div className="flex items-center gap-2.5 text-slate-800 font-semibold text-base">
                                <div className="p-1.5 bg-blue-100/50 text-blue-600 rounded-[0.2rem] border border-blue-100">
                                    <Phone className="h-3.5 w-3.5" />
                                </div>
                                Contact Information
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

                            <div className="flex flex-col gap-1.5 p-2 rounded-[0.2rem] hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2 text-slate-400 mb-0.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Email</span>
                                </div>
                                <p className="text-slate-900 font-medium text-sm truncate" title={user.email}>{user.email}</p>
                            </div>

                            <div className="flex flex-col gap-1.5 p-2 rounded-[0.2rem] hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2 text-slate-400 mb-0.5">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Phone</span>
                                </div>
                                <p className="text-slate-900 font-medium text-sm">{user.phone_number || 'Not added'}</p>
                            </div>

                            <div className="flex flex-col gap-1.5 p-2 rounded-[0.2rem] hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-2 text-slate-400 mb-0.5">
                                    <Globe className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Location</span>
                                </div>
                                <p className="text-slate-900 font-medium text-sm">{user.country || 'Not added'}</p>
                            </div>

                            {user.address && (
                                <div className="col-span-full border-t border-slate-100 pt-3 mt-1 flex gap-2 text-slate-600">
                                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                    <span className="font-medium text-sm">{user.address}</span>
                                </div>
                            )}

                        </CardContent>
                    </Card>

                    {/* Professional & Education Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Work Experience */}
                        <Card className="group shadow-sm hover:shadow-md transition-all duration-300 border-slate-200 h-full flex flex-col rounded-[0.2rem]">
                            <CardHeader className="pb-3 border-b border-slate-50 py-3">
                                <CardTitle className="flex items-center gap-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">
                                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                    Experience
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 pt-4">
                                <div className="">
                                    <h3 className="text-base font-bold text-slate-900 leading-tight mb-1">{user.occupation || 'No Position'}</h3>
                                    <div className="flex items-center gap-2 text-blue-600 font-medium bg-blue-50/50 w-fit px-2 py-0.5 rounded-[0.2rem] mt-1">
                                        <Building2 className="h-3 w-3" />
                                        <span className="text-xs">{user.institution || 'No Organization'}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                        Current primary professional affiliation and role details.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education */}
                        <Card className="group shadow-sm hover:shadow-md transition-all duration-300 border-slate-200 h-full flex flex-col rounded-[0.2rem]">
                            <CardHeader className="pb-3 border-b border-slate-50 py-3">
                                <CardTitle className="flex items-center gap-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">
                                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                                    Education
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 pt-4">
                                <div className="">
                                    <h3 className="text-base font-bold text-slate-900 leading-tight mb-1">{user.education_level || 'No Degree'}</h3>
                                    <div className="flex items-center gap-2 text-blue-600 font-medium bg-blue-50/50 w-fit px-2 py-0.5 rounded-[0.2rem] mt-1">
                                        <Award className="h-3 w-3" />
                                        <span className="text-xs">Graduate Status</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                        Highest level of education achieved and academic background.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
