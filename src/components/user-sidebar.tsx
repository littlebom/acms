'use client';

import Link from "next/link";
import {
    LayoutDashboard,
    User,
    FileText,
    Ticket,
    LogOut,
    ClipboardList,
    Send,
    FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

const sidebarItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Conference Registration", href: "/register-conference", icon: Ticket },
    { label: "Submit Paper", href: "/submit-paper", icon: Send },
    { label: "My Submissions", href: "/my-submissions", icon: FileText },
    { label: "Review Assignments", href: "/reviewer/assignments", icon: FileCheck },
    { label: "Questionnaires", href: "/questionnaires", icon: ClipboardList },
];

export function UserSidebar() {
    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-slate-100">
                <Link href="/" className="text-2xl font-bold text-primary">
                    ACMS
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {sidebarItems.map((item, i) => (
                    <Link key={i} href={item.href}>
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-indigo-600 hover:bg-indigo-50">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Button>
                    </Link>
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
