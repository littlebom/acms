'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    MapPin,
    Phone,
    Mail,
    Building2,
    GraduationCap,
    Briefcase,
    Calendar,
    User
} from 'lucide-react';

interface ProfileViewProps {
    user: any;
}

export default function ProfileView({ user }: ProfileViewProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative">
                {/* Banner Background */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl lg:rounded-xl"></div>

                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 sm:-mt-16 gap-6">
                        {/* Avatar */}
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
                            <AvatarImage src={user.profile_image || undefined} className="object-cover" />
                            <AvatarFallback className="text-4xl font-bold text-indigo-600 bg-slate-50">
                                {user.first_name?.[0]}
                            </AvatarFallback>
                        </Avatar>

                        {/* Main Identity */}
                        <div className="flex-1 text-center sm:text-left space-y-1 sm:mb-2">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                {user.title} {user.first_name} {user.last_name}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-slate-600">
                                <Badge variant="secondary" className="capitalize">
                                    {user.role}
                                </Badge>
                                {user.country && (
                                    <span className="flex items-center text-sm">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {user.country}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Contact & Personal */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-semibold text-slate-700">
                            Contact Information
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Email</p>
                                    <p className="text-sm font-medium text-slate-900 truncate" title={user.email}>{user.email}</p>
                                </div>
                            </div>

                            {user.phone_number && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Phone</p>
                                        <p className="text-sm font-medium text-slate-900">{user.phone_number}</p>
                                    </div>
                                </div>
                            )}

                            {user.address && (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Address</p>
                                        <p className="text-sm text-slate-700 leading-relaxed">{user.address}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-semibold text-slate-700">
                            Personal Details
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase">Gender</p>
                                    <p className="text-sm font-medium text-slate-900 flex items-center gap-2 mt-1">
                                        <User className="h-3 w-3 text-slate-400" />
                                        {user.gender || '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase">Birth Year</p>
                                    <p className="text-sm font-medium text-slate-900 flex items-center gap-2 mt-1">
                                        <Calendar className="h-3 w-3 text-slate-400" />
                                        {user.birth_year || '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Professional & Bio */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Professional Info */}
                    <Card className="border-slate-200 shadow-sm">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-semibold text-slate-700 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Professional Profile
                        </div>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500">Education Level</p>
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5 text-indigo-500" />
                                        <p className="font-semibold text-slate-900">{user.education_level || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500">Occupation</p>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-indigo-500" />
                                        <p className="font-semibold text-slate-900">{user.occupation || '-'}</p>
                                    </div>
                                </div>
                                <div className="sm:col-span-2 space-y-1 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-sm text-slate-500">Institution / Workplace</p>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-indigo-500" />
                                        <p className="font-medium text-slate-900">{user.institution || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio */}
                    <Card className="border-slate-200 shadow-sm h-full">
                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 font-semibold text-slate-700">
                            About Me
                        </div>
                        <CardContent className="p-6">
                            {user.bio ? (
                                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {user.bio}
                                </p>
                            ) : (
                                <p className="text-slate-400 italic text-center py-6">
                                    No biography provided.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
