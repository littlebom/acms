import { getSystemSettings } from "@/app/actions/settings";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Youtube, MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export async function PublicFooter() {
    const settings = await getSystemSettings();

    return (
        <footer className="bg-slate-900 text-slate-200 py-16 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Brand Section */}
                    <div className="md:col-span-4 space-y-6">
                        <Link href="/" className="inline-block">
                            {settings.logo_url ? (
                                <Image
                                    src={settings.logo_url}
                                    alt={settings.system_name || "Logo"}
                                    width={140}
                                    height={50}
                                    className="h-12 w-auto object-contain brightness-0 invert"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-white tracking-tight">
                                    {settings.system_name || "ACMS"}
                                </span>
                            )}
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            {settings.description || "The Academic Conference Management System. Streamlining conference organization for everyone."}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4 pt-2">
                            {settings.social_facebook && (
                                <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-blue-600 transition-colors">
                                    <Facebook className="h-4 w-4" />
                                </a>
                            )}
                            {settings.social_twitter && (
                                <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors">
                                    <Twitter className="h-4 w-4" />
                                </a>
                            )}
                            {settings.social_linkedin && (
                                <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-blue-700 transition-colors">
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            )}
                            {settings.social_youtube && (
                                <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-red-600 transition-colors">
                                    <Youtube className="h-4 w-4" />
                                </a>
                            )}
                            {settings.social_line && (
                                <a href={settings.social_line} target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2 rounded-full hover:bg-green-600 transition-colors">
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="text-white font-semibold uppercase tracking-wider text-xs">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/schedule" className="text-slate-400 hover:text-white transition-colors">Schedule</Link></li>
                            <li><Link href="/speakers" className="text-slate-400 hover:text-white transition-colors">Speakers</Link></li>
                            <li><Link href="/sponsors" className="text-slate-400 hover:text-white transition-colors">Sponsorship</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="text-white font-semibold uppercase tracking-wider text-xs">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="md:col-span-4 space-y-6">
                        <h4 className="text-white font-semibold uppercase tracking-wider text-xs">Contact Information</h4>
                        <ul className="space-y-4 text-sm">
                            {settings.contact_email && (
                                <li className="flex items-center gap-3 text-slate-400">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                    <a href={`mailto:${settings.contact_email}`} className="hover:text-white transition-colors">
                                        {settings.contact_email}
                                    </a>
                                </li>
                            )}
                            {settings.contact_phone && (
                                <li className="flex items-center gap-3 text-slate-400">
                                    <Phone className="h-4 w-4 text-slate-500" />
                                    <a href={`tel:${settings.contact_phone}`} className="hover:text-white transition-colors">
                                        {settings.contact_phone}
                                    </a>
                                </li>
                            )}
                            {settings.contact_address && (
                                <li className="flex items-start gap-3 text-slate-400 text-balance leading-relaxed">
                                    <MapPin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                                    <span>{settings.contact_address}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} {settings.system_name || "ACMS"}. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Powered by <span className="text-slate-400 font-medium">Academic Conference Management System</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
