import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSystemSettings } from "@/app/actions/settings";
import { Menu } from "lucide-react";
import Image from "next/image";

export async function PublicNavbar() {
    const settings = await getSystemSettings();

    return (
        <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
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

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>
                    <Link href="/schedule" className="text-sm font-medium hover:text-primary transition-colors">
                        Schedule
                    </Link>
                    <Link href="/speakers" className="text-sm font-medium hover:text-primary transition-colors">
                        Speakers
                    </Link>
                    {settings.show_proceedings_menu && (
                        <Link href="/archives" className="text-sm font-medium hover:text-primary transition-colors">
                            Proceedings
                        </Link>
                    )}
                    <Link href="/sponsors" className="text-sm font-medium hover:text-primary transition-colors">
                        Sponsorship
                    </Link>
                    <Link href="/news" className="text-sm font-medium hover:text-primary transition-colors">
                        News
                    </Link>
                    <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                        Contact
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/register">
                        <Button>Register</Button>
                    </Link>
                </div>

                {/* Mobile Menu Placeholder */}
                <div className="md:hidden">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
