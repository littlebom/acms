import Link from "next/link";
import { getSystemSettings } from "@/app/actions/settings";
import Image from "next/image";

export async function Footer() {
    const settings = await getSystemSettings();

    return (
        <footer className="w-full border-t bg-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div>
                        {settings.logo_url ? (
                            <Image
                                src={settings.logo_url}
                                alt={settings.system_name || "ACMS"}
                                width={120}
                                height={40}
                                className="h-10 w-auto object-contain mb-4"
                            />
                        ) : (
                            <h3 className="mb-4 text-lg font-bold">{settings.system_name || "ACMS"}</h3>
                        )}
                        <p className="text-sm text-muted-foreground">
                            The premier academic conference management system for organizing and managing world-class events.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                            <li><Link href="/schedule" className="hover:text-primary">Schedule</Link></li>
                            <li><Link href="/speakers" className="hover:text-primary">Speakers</Link></li>
                            <li><Link href="/news" className="hover:text-primary">News</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="hover:text-primary">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>contact@confanalytica.com</li>
                            <li>+66 2 123 4567</li>
                            <li>Bangkok, Thailand</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; 2025 ConfAnalytica. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
