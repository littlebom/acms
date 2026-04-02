'use client';

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    Settings,
    LogOut,
    Mic2,
    CheckSquare,
    CreditCard,
    Bell,
    Globe,
    ShieldAlert,
    HelpCircle,
    Ticket,
    Image as ImageIcon,
    ClipboardList,
    ScanLine,
    Bot,
    Newspaper,
    Handshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { EventSwitcher } from "@/components/admin/event-switcher";

const sidebarItems = [
    {
        title: "Overview",
        items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        ]
    },
    {
        title: "Conference",
        items: [
            { label: "Dashboard", href: "/admin/conference", icon: LayoutDashboard },
            { label: "Events", href: "/admin/conference/events", icon: Calendar },
            { label: "Schedule", href: "/admin/conference/schedule", icon: Calendar },
            { label: "Speakers", href: "/admin/speakers", icon: Mic2 },
            { label: "Tickets", href: "/admin/conference/tickets", icon: Ticket },
            { label: "Registrations", href: "/admin/conference/registrations", icon: CreditCard },
            { label: "Check-in List", href: "/admin/conference/check-in-list", icon: ClipboardList },
        ]
    },
    {
        title: "Academic",
        items: [
            { label: "Dashboard", href: "/admin/papers/dashboard", icon: LayoutDashboard },
            { label: "Papers", href: "/admin/papers", icon: FileText },
            { label: "Tracks", href: "/admin/papers/tracks", icon: FileText },
            { label: "Reviewers", href: "/admin/papers/reviewers", icon: Users },
            { label: "Export", href: "/admin/papers/export", icon: FileText },
        ]
    },
    {
        title: "Engagement",
        items: [
            { label: "Questions", href: "/admin/questions", icon: HelpCircle },
            { label: "Notifications", href: "/admin/notifications", icon: Bell },
            { label: "News & PR", href: "/admin/engagement/news", icon: Newspaper },
            { label: "AI Chatbot", href: "/admin/engagement/chatbot", icon: Bot },
            { label: "Sponsorship", href: "/admin/engagement/sponsors", icon: Handshake },
        ]
    },
    {
        title: "System",
        items: [
            { label: "Users", href: "/admin/system/users", icon: Users },
            { label: "Media Library", href: "/admin/system/media", icon: ImageIcon },
            { label: "Settings", href: "/admin/system/setting", icon: Settings },
            { label: "Event Logs", href: "/admin/system/logs", icon: ClipboardList },
        ]
    }
];

interface AdminSidebarProps {
    events: any[];
    selectedEventId: number;
    showAcademic?: boolean;
}

export function AdminSidebar({ events, selectedEventId, showAcademic = true }: AdminSidebarProps) {
    const pathname = usePathname();
    const isCheckInPage = pathname === '/admin/conference/check-in';
    const isBuilderPage = pathname?.startsWith('/admin/website/builder');
    const isFullScreenPage = isCheckInPage || isBuilderPage;

    if (isFullScreenPage) return null;

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-slate-100">
                <Link href="/" className="text-2xl font-bold text-primary">
                    ACMS
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                {/* Event Switcher */}
                <div className="px-6 mb-2">
                    <EventSwitcher events={events} selectedId={selectedEventId} />
                </div>

                {/* ... existing loop ... */}

                {sidebarItems
                    .filter((group) => showAcademic || group.title !== 'Academic')
                    .map((group, i) => (
                    <div key={i} className="mb-6 px-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item, j) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link key={j} href={item.href}>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={`w-full justify-start ${isActive
                                                ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                                                : "text-slate-600 hover:text-primary hover:bg-slate-50"
                                                }`}
                                        >
                                            <item.icon className="mr-2 h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-100">
                <form action={logout}>
                    <Button
                        type="submit"
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </form>
            </div>
        </aside>
    );
}
