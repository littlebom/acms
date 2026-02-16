import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    GraduationCap,
    Award,
    Globe
} from 'lucide-react';

// Modern "Clean & Centered" Layout
// Focuses on readability and clear hierarchy

async function getUser(id: string) {
    try {
        const users = await query('SELECT * FROM users WHERE id = ?', [parseInt(id)]) as any[];
        return users.length > 0 ? users[0] : null;
    } catch (e) {
        return null;
    }
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const user = await getUser(resolvedParams.id);

    if (!user) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* 1. Header Hero Section */}
            <div className="relative bg-white shadow-sm border-b border-slate-200">
                {/* Cover Banner */}
                <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-20 sm:-mt-24 mb-6 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="h-32 w-32 md:h-48 md:w-48 rounded-full border-4 border-white shadow-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                                {user.profile_image ? (
                                    <img src={user.profile_image} alt={user.first_name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl md:text-6xl font-bold text-slate-400 select-none">
                                        {user.first_name?.[0]}
                                    </span>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 h-5 w-5 md:h-6 md:w-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex-1 pb-2 md:pb-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                                {user.title} {user.first_name} {user.last_name}
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 font-medium mb-4">
                                {user.occupation || 'Professional Member'}
                                {user.institution && (
                                    <span className="text-slate-400 mx-2 font-normal">at</span>
                                )}
                                {user.institution}
                            </p>

                            {/* Tags/Badges */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-indigo-100 text-indigo-700`}>
                                    {user.role}
                                </span>
                                {user.country && (
                                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                        <Globe className="h-3 w-3" />
                                        {user.country}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pb-4 shrink-0">
                            <Link
                                href="/login"
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors gap-2"
                            >
                                <Mail className="h-4 w-4" />
                                Connect
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Grid */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Details */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-indigo-500" />
                                Contact Info
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                    <span className="text-sm font-medium">{user.email}</span>
                                </div>
                                {user.phone_number && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                                        <span className="text-sm font-medium">{user.phone_number}</span>
                                    </div>
                                )}
                                {user.address && (
                                    <div className="flex items-start gap-3 text-slate-600">
                                        <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{user.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Personal Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-slate-900 font-bold text-lg mb-4 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-500" />
                                Personal
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500 text-sm">Gender</span>
                                    <span className="text-slate-900 font-medium text-sm">{user.gender || '-'}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500 text-sm">Birth Year</span>
                                    <span className="text-slate-900 font-medium text-sm">{user.birth_year || '-'}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="text-slate-500 text-sm">Member Since</span>
                                    <span className="text-slate-900 font-medium text-sm">
                                        {user.created_at ? new Date(user.created_at).getFullYear() : '2025'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bio & Experience */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* About Me */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                            <h3 className="text-slate-900 font-bold text-xl mb-6 border-l-4 border-indigo-500 pl-4">About Me</h3>
                            {user.bio ? (
                                <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                                    {user.bio}
                                </p>
                            ) : (
                                <p className="text-slate-400 italic">No biography provided.</p>
                            )}
                        </div>

                        {/* Education & Experience Stack */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Professional Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg">Occupation</h4>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-lg">{user.occupation || 'Not Specified'}</p>
                                    <p className="text-slate-500 mt-1">{user.institution || 'Organization'}</p>
                                </div>
                            </div>

                            {/* Education Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                                        <GraduationCap className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-lg">Education</h4>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-lg">{user.education_level || 'Not Specified'}</p>
                                    <p className="text-slate-500 mt-1">Graduate</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
