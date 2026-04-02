'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    LogOut, User, ChevronDown, LayoutDashboard, ClipboardList, Bell,
} from 'lucide-react';
import { logout } from '@/app/actions/auth';

const ROLE_LABELS: Record<string, string> = {
    attendee: 'Attendee',
    speaker: 'Speaker',
    reviewer: 'Reviewer',
    chair: 'Chair',
    admin: 'Admin',
    super_admin: 'Super Admin',
};

interface PublicUserMenuProps {
    userId: number;
    userName: string;
    userEmail: string;
    userImage?: string;
    role: string;
    pendingSurveys?: number;
    unreadCount?: number;
}

export function PublicUserMenu({
    userId, userName, userEmail, userImage, role,
    pendingSurveys = 0, unreadCount = 0,
}: PublicUserMenuProps) {
    const initial = userName?.[0]?.toUpperCase() ?? '?';
    const isAdmin = role === 'admin' || role === 'super_admin';
    const totalBadge = pendingSurveys + unreadCount;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button suppressHydrationWarning className="flex items-center gap-2 hover:bg-slate-100 rounded-full pl-1 pr-2 py-1 transition-colors outline-none">
                    <div className="relative">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={userImage} className="object-cover" />
                            <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                {initial}
                            </AvatarFallback>
                        </Avatar>
                        {totalBadge > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-0.5 leading-none">
                                {totalBadge > 9 ? '9+' : totalBadge}
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
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{userName}</p>
                        {role && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                                {ROLE_LABELS[role] ?? role}
                            </Badge>
                        )}
                    </div>
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
                    <Link href={`/dashboard/profile/${userId}?tab=notifications`} className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
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

                {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Admin Dashboard
                        </Link>
                    </DropdownMenuItem>
                )}

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
    );
}
