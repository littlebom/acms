import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSystemSettings } from "@/app/actions/settings";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { Bell } from "lucide-react";
import Image from "next/image";
import { PublicUserMenu } from "@/components/public-user-menu";
import { PublicMobileMenu } from "@/components/public-mobile-menu";
import { getActiveQuestionnaires } from "@/app/actions/questions";
import { getUnreadNotificationCount } from "@/app/actions/notifications";

const ROLE_LABELS: Record<string, string> = {
    attendee: 'Attendee',
    speaker: 'Speaker',
    reviewer: 'Reviewer',
    chair: 'Chair',
    admin: 'Admin',
    super_admin: 'Super Admin',
};

export async function PublicNavbar() {
    const [settings, session] = await Promise.all([
        getSystemSettings(),
        getSession(),
    ]);

    let userName = '';
    let userEmail = '';
    let userImage: string | undefined;
    let pendingSurveys = 0;
    let unreadCount = 0;

    if (session) {
        try {
            const [rows, questionnaires, notifCount] = await Promise.all([
                query(
                    'SELECT first_name, last_name, email, profile_image FROM users WHERE id = ?',
                    [session.userId]
                ) as Promise<any[]>,
                getActiveQuestionnaires(undefined, session.userId) as Promise<any[]>,
                getUnreadNotificationCount(session.userId),
            ]);
            if (rows[0]) {
                const u = rows[0];
                userName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email;
                userEmail = u.email;
                userImage = u.profile_image || undefined;
            }
            pendingSurveys = questionnaires.filter((q: any) => !q.is_completed).length;
            unreadCount = notifCount;
        } catch {
            userName = session.email ?? '';
            userEmail = session.email ?? '';
        }
    }

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/schedule', label: 'Schedule' },
        { href: '/speakers', label: 'Speakers' },
        ...(settings.show_proceedings_menu ? [{ href: '/archives', label: 'Proceedings' }] : []),
        { href: '/sponsors', label: 'Sponsorship' },
        { href: '/news', label: 'News' },
        { href: '/contact', label: 'Contact' },
    ];

    return (
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    {settings.logo_url ? (
                        <Image
                            src={settings.logo_url}
                            alt={settings.system_name || "Logo"}
                            width={120}
                            height={40}
                            className="h-10 w-auto object-contain"
                        />
                    ) : (
                        <span className="text-2xl font-bold text-primary">
                            {settings.system_name || "ACMS"}
                        </span>
                    )}
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-slate-600 hover:text-primary px-3 py-2 rounded-md hover:bg-slate-100 transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Spacer for mobile */}
                <div className="flex-1 md:hidden" />

                {/* Right Section: Role Badge + Notification Bell + Avatar / Login */}
                <div className="flex items-center gap-2 shrink-0">
                    {session ? (
                        <>
                            {/* Role Badge — desktop only */}
                            {session.role && (
                                <Badge variant="outline" className="hidden lg:inline-flex text-xs">
                                    {ROLE_LABELS[session.role] ?? session.role}
                                </Badge>
                            )}

                            {/* Notification Bell */}
                            <Link
                                href={`/dashboard/profile/${session.userId}?tab=notifications`}
                                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <Bell className="h-4 w-4 text-slate-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold px-0.5 leading-none">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </Link>

                            {/* Avatar Dropdown */}
                            <PublicUserMenu
                                userId={session.userId}
                                userName={userName}
                                userEmail={userEmail}
                                userImage={userImage}
                                role={session.role ?? ''}
                                pendingSurveys={pendingSurveys}
                                unreadCount={unreadCount}
                            />
                        </>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button>Register</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <PublicMobileMenu
                        isLoggedIn={!!session}
                        userName={userName}
                        userEmail={userEmail}
                        userImage={userImage}
                        userId={session?.userId}
                        role={session?.role}
                        pendingSurveys={pendingSurveys}
                        unreadCount={unreadCount}
                        showProceedings={settings.show_proceedings_menu}
                    />
                </div>
            </div>
        </nav>
    );
}
