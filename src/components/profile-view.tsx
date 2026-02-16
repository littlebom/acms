'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    MapPin,
    Phone,
    Mail,
    Building2,
    GraduationCap,
    Briefcase,
    Calendar,
    User,
    Award,
    Globe
} from 'lucide-react';

interface ProfileViewProps {
    user: any;
}

export default function ProfileView({ user }: ProfileViewProps) {
    return (
        <div className="bg-white shadow-2xl rounded-xl overflow-hidden max-w-5xl mx-auto border border-slate-100 min-h-[800px] flex flex-col md:flex-row">

            {/* Left Sidebar (Resume Style) */}
            <div className="w-full md:w-1/3 bg-slate-900 text-slate-100 p-8 flex flex-col gap-6 relative overflow-hidden text-center md:text-left">
                {/* Decorative Background Element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>

                {/* Avatar & Identity Section */}
                <div className="flex flex-col items-center text-center space-y-4 pt-4 mb-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <Avatar className="h-40 w-40 border-4 border-slate-800 relative shadow-xl">
                            <AvatarImage src={user.profile_image || undefined} className="object-cover" />
                            <AvatarFallback className="text-5xl font-bold text-slate-900 bg-slate-200">
                                {user.first_name?.[0]}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
                            {user.title} {user.first_name} <br /> {user.last_name}
                        </h1>
                        <p className="text-indigo-400 font-medium uppercase tracking-widest text-sm">
                            {user.occupation || 'Professional Member'}
                        </p>
                    </div>

                    <div className="pt-2">
                        <Badge variant="outline" className="border-indigo-500/50 text-indigo-300 capitalize bg-indigo-500/10 hover:bg-indigo-500/20">
                            {user.role}
                        </Badge>
                    </div>
                </div>

                <Separator className="bg-slate-700/50" />

                {/* Contact Info */}
                <div className="space-y-4 text-left w-full">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Contact Details</h3>

                    <div className="space-y-3 text-sm text-slate-300">
                        <div className="flex items-start gap-3 group">
                            <div className="p-2 rounded bg-slate-800 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                <Mail className="h-4 w-4" />
                            </div>
                            <span className="break-all pt-1.5">{user.email}</span>
                        </div>
                        {user.phone_number && (
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded bg-slate-800 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <span>{user.phone_number}</span>
                            </div>
                        )}
                        {user.address && (
                            <div className="flex items-start gap-3 group">
                                <div className="p-2 rounded bg-slate-800 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <span className="pt-1.5 text-left">{user.address}</span>
                            </div>
                        )}
                        {user.country && (
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded bg-slate-800 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <span>{user.country}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Separator className="bg-slate-700/50" />

                {/* Personal Details */}
                <div className="space-y-4 text-left w-full">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Personal Info</h3>
                    <div className="space-y-3 text-sm text-slate-300">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">Gender</span>
                            <span>{user.gender || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-500">Birth Year</span>
                            <span>{user.birth_year || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Content Area (Resume Body) */}
            <div className="w-full md:w-2/3 p-8 md:p-12 space-y-10 bg-white">

                {/* Profile Summary */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
                        Profile
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-lg border-l-4 border-indigo-100 pl-4 py-1">
                        {user.bio || "No professional summary provided. Update your profile to add a bio."}
                    </p>
                </div>

                {/* Experience / Work */}
                <div className="space-y-8">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
                        Work Experience
                    </h3>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {/* Dynamic Item */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            {/* Icon Dot */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-hover:bg-indigo-500 group-hover:text-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10">
                                <Briefcase className="w-5 h-5" />
                            </div>

                            {/* Card content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-slate-50 border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col space-y-1">
                                    <div className="font-bold text-slate-900">{user.occupation || 'Position'}</div>
                                    <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                                        {user.institution || 'Organization'}
                                    </div>
                                    <p className="text-slate-500 text-sm mt-2 line-clamp-3">
                                        Current professional role.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education */}
                <div className="space-y-8">
                    <h3 className="text-lg font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <span className="w-8 h-1 bg-indigo-500 rounded-full"></span>
                        Education
                    </h3>

                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            {/* Icon Dot */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-hover:bg-indigo-500 group-hover:text-white text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors z-10">
                                <GraduationCap className="w-5 h-5" />
                            </div>

                            {/* Card content */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-slate-50 border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col space-y-1">
                                    <div className="font-bold text-slate-900">{user.education_level || 'Degree'}</div>
                                    <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                                        Graduate
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
