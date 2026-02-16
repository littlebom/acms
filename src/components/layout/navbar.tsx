import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { getSystemSettings } from "@/app/actions/settings";
import { getEvent } from "@/app/actions/events";
import Image from "next/image";

export async function Navbar() {
    const settings = await getSystemSettings();
    const event = await getEvent();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
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
                            <span className="text-xl font-bold text-primary">
                                {settings.system_name}
                            </span>
                        )}
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Home
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            About
                        </Link>
                        <Link href="/schedule" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Schedule
                        </Link>
                        <Link href="/speakers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Speakers
                        </Link>
                        {settings.show_proceedings_menu && (
                            <Link href="/archives" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                Proceedings
                            </Link>
                        )}
                        <Link href="/news" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            News
                        </Link>
                        <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            Contact
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="ghost" className="text-primary hover:text-primary/90 hover:bg-primary/10">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button className="bg-primary text-white hover:bg-primary/90">
                                Register
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button (Placeholder) */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
