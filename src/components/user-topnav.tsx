'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    LogOut, User, Pencil, ChevronDown, ClipboardList, ArrowLeft,
} from 'lucide-react';
import { logout } from '@/app/actions/auth';

type Role = 'attendee' | 'reviewer' | 'chair' | 'speaker' | 'admin' | string;

interface UserTopNavProps {
    role: Role;
    userId: number;
    userName: string;
    userEmail: string;
    userImage?: string;
    pendingSurveys?: number;
    logoUrl?: string;
    systemName?: string;
}

export function UserTopNav({
    role, userId, userName, userEmail, userImage, pendingSurveys = 0,
    logoUrl, systemName = 'ACMS',
}: UserTopNavProps) {
    const initial = userName?.[0]?.toUpperCase() ?? '?';

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

                {/* Logo */}
                <Link href={`/dashboard/profile/${userId}`} className="flex items-center gap-2 shrink-0">
                    {logoUrl ? (
                        <Image
                            src={logoUrl}
                            alt={systemName}
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                    ) : (
                        <span className="text-xl font-bold text-primary">{systemName}</span>
                    )}
                </Link>

                {/* Back to Site */}
                <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Back to Site</span>
                </Link>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Avatar Dropdown — with pending surveys badge */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button suppressHydrationWarning className="relative flex items-center gap-2 hover:bg-slate-100 rounded-full pl-1 pr-2 py-1 transition-colors outline-none">
                            {/* Avatar with notification dot */}
                            <div className="relative">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={userImage} className="object-cover" />
                                    <AvatarFallback className="text-sm font-bold bg-indigo-100 text-indigo-700">
                                        {initial}
                                    </AvatarFallback>
                                </Avatar>
                                {pendingSurveys > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-0.5 leading-none">
                                        {pendingSurveys > 9 ? '9+' : pendingSurveys}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 hidden md:block max-w-[130px] truncate">
                                {userName}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuLabel>
                            <p className="text-sm font-semibold truncate">{userName}</p>
                            <p className="text-xs text-slate-500 font-normal truncate">{userEmail}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/profile/${userId}`} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                My Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/profile/${userId}?tab=surveys`} className="cursor-pointer">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                <span>Surveys</span>
                                {pendingSurveys > 0 && (
                                    <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                        {pendingSurveys} pending
                                    </span>
                                )}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/profile/${userId}/edit`} className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <form action={logout} className="w-full">
                                <button type="submit" className="flex w-full items-center text-red-500 hover:text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
