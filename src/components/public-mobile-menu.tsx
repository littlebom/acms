'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
    Menu, Home, Info, Calendar, Mic2, Archive, Heart, Newspaper,
    Mail, LogOut, User, ClipboardList, LayoutDashboard, Bell,
} from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface PublicMobileMenuProps {
    isLoggedIn: boolean;
    userName?: string;
    userEmail?: string;
    userImage?: string;
    userId?: number;
    role?: string;
    pendingSurveys?: number;
    unreadCount?: number;
    showProceedings?: boolean;
}

export function PublicMobileMenu({
    isLoggedIn, userName, userEmail, userImage, userId,
    role, pendingSurveys = 0, unreadCount = 0, showProceedings,
}: PublicMobileMenuProps) {
    const [open, setOpen] = useState(false);
    const initial = userName?.[0]?.toUpperCase() ?? '?';
    const isAdmin = role === 'admin' || role === 'super_admin';

    const navItems: NavItem[] = [
        { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
        { href: '/about', label: 'About', icon: <Info className="h-4 w-4" /> },
        { href: '/schedule', label: 'Schedule', icon: <Calendar className="h-4 w-4" /> },
        { href: '/speakers', label: 'Speakers', icon: <Mic2 className="h-4 w-4" /> },
        ...(showProceedings ? [{ href: '/archives', label: 'Proceedings', icon: <Archive className="h-4 w-4" /> }] : []),
        { href: '/sponsors', label: 'Sponsorship', icon: <Heart className="h-4 w-4" /> },
        { href: '/news', label: 'News', icon: <Newspaper className="h-4 w-4" /> },
        { href: '/contact', label: 'Contact', icon: <Mail className="h-4 w-4" /> },
    ];

    return (
        <>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="right" className="w-72 p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                    {/* User Info Header */}
                    {isLoggedIn && (
                        <div className="border-b px-5 py-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={userImage} className="object-cover" />
                                    <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                                        {initial}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate">{userName}</p>
                                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nav Links */}
                    <nav className="flex flex-col py-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Actions or Login/Register */}
                    <div className="border-t">
                        {isLoggedIn ? (
                            <div className="flex flex-col py-2">
                                <Link
                                    href={`/dashboard/profile/${userId}`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <User className="h-4 w-4" />
                                    My Profile
                                </Link>
                                <Link
                                    href={`/dashboard/profile/${userId}?tab=surveys`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <ClipboardList className="h-4 w-4" />
                                    Surveys
                                    {pendingSurveys > 0 && (
                                        <span className="ml-auto bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                            {pendingSurveys}
                                        </span>
                                    )}
                                </Link>
                                <Link
                                    href={`/dashboard/profile/${userId}?tab=notifications`}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <Bell className="h-4 w-4" />
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </Link>
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        Admin Dashboard
                                    </Link>
                                )}
                                <div className="border-t my-1" />
                                <form action={logout}>
                                    <button
                                        type="submit"
                                        className="flex w-full items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 p-4">
                                <Link href="/login" onClick={() => setOpen(false)}>
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link href="/register" onClick={() => setOpen(false)}>
                                    <Button className="w-full">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
