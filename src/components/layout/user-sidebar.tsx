import { Home, User, FileText, CreditCard, Star } from "lucide-react"
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

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "My Profile",
        url: "/dashboard/profile",
        icon: User,
    },
    {
        title: "My Papers",
        url: "/dashboard/papers",
        icon: FileText,
    },
    {
        title: "My Reviews",
        url: "/dashboard/reviews",
        icon: Star,
    },
    {
        title: "Registration",
        url: "/register-conference",
        icon: CreditCard,
    },
]

export async function UserSidebar() {
    const settings = await getSystemSettings();

    return (
        <Sidebar>
            <SidebarHeader className="border-b p-4">
                {settings.logo_url ? (
                    <Image
                        src={settings.logo_url}
                        alt={settings.system_name || "ACMS"}
                        width={120}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                ) : (
                    <h2 className="text-lg font-bold text-primary">{settings.system_name}</h2>
                )}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
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
