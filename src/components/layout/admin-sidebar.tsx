import { Home, Users, FileText, Calendar, Settings, Ticket, ClipboardList, Globe, Bell, HelpCircle, ShieldAlert, Bot, Handshake, BookOpen } from "lucide-react"
import {

    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { getSystemSettings } from "@/app/actions/settings"
import Image from "next/image"


// Main menu items
const mainItems = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: Home,
    },
]

// Conference menu items
const conferenceItems = [
    {
        title: "Dashboard",
        url: "/admin/conference",
        icon: Home, // Using Home or LayoutDashboard if available, reusing Home for consistency with main dashboard
    },
    {
        title: "Events",
        url: "/admin/conference/events",
        icon: Calendar,
    },
    {
        title: "Tickets",
        url: "/admin/conference/tickets",
        icon: Ticket,
    },
    {
        title: "Registrations",
        url: "/admin/conference/registrations",
        icon: ClipboardList,
    },
]

// Academic menu items
const academicItems = [
    {
        title: "Papers",
        url: "/admin/papers",
        icon: FileText,
    },
    {
        title: "Abstract Book",
        url: "/admin/papers/abstract-book",
        icon: BookOpen,
    },
]

// Engagement menu items
const engagementItems = [
    {
        title: "Questionnaires",
        url: "/admin/questions",
        icon: HelpCircle,
    },
    {
        title: "Notifications",
        url: "/admin/notifications",
        icon: Bell,
    },
    {
        title: "Chatbot",
        url: "/admin/engagement/chatbot",
        icon: Bot,
    },
    {
        title: "Sponsorship",
        url: "/admin/engagement/sponsors",
        icon: Handshake,
    },
]

// Website menu items
const websiteItems = [
    {
        title: "Website",
        url: "/admin/website",
        icon: Globe,
    },
]

// System menu items
const systemItems = [
    {
        title: "Users",
        url: "/admin/system/users",
        icon: Users,
    },
    {
        title: "Settings",
        url: "/admin/system/setting",
        icon: Settings,
    },
    {
        title: "Event Logs",
        url: "/admin/system/logs",
        icon: ShieldAlert,
    },
]

export async function AdminSidebar() {
    const settings = await getSystemSettings();

    return (
        <Sidebar>
            <SidebarHeader className="border-b p-4">
                {settings.logo_url ? (
                    <Image
                        src={settings.logo_url}
                        alt={settings.system_name || "Logo"}
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                ) : (
                    <h2 className="text-lg font-bold text-primary">{settings.system_name || "ACMS"}</h2>
                )}
            </SidebarHeader>
            <SidebarContent>
                {/* Main */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {mainItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Academic */}
                <SidebarGroup>
                    <SidebarGroupLabel>Academic</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {academicItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Conference */}
                <SidebarGroup>
                    <SidebarGroupLabel>Conference</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {conferenceItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Engagement */}
                <SidebarGroup>
                    <SidebarGroupLabel>Engagement</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {engagementItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Website */}
                <SidebarGroup>
                    <SidebarGroupLabel>Content</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {websiteItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* System */}
                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {systemItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

