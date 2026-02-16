import { getSponsors } from "@/app/actions/sponsors";
import { getSystemSettings } from "@/app/actions/settings";
import { Globe, Phone, Building2 } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function SponsorsPage() {
    const sponsors = await getSponsors();
    const settings = await getSystemSettings();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header section */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Our Sponsors
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        We are grateful for the support of our esteemed sponsors who help make {settings.system_name || "this conference"} a success.
                    </p>
                </div>
            </div>

            {/* Sponsors Grid */}
            <div className="container mx-auto px-4 py-20">
                {sponsors.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 text-lg">More sponsors coming soon.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {sponsors.map((sponsor) => (
                            <div
                                key={sponsor.id}
                                className="bg-white rounded-[5px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col items-center text-center"
                            >
                                {/* Logo Wrapper */}
                                <div className="w-full aspect-square max-w-[180px] mb-6 relative flex items-center justify-center p-4 bg-slate-50 rounded-[5px] group-hover:bg-white transition-colors duration-300">
                                    {sponsor.logo_url ? (
                                        <img
                                            src={sponsor.logo_url}
                                            alt={sponsor.name_en}
                                            className="max-w-full max-h-full object-contain filter grayscale-[0.5] opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                                        />
                                    ) : (
                                        <Building2 className="w-16 h-16 text-slate-200" />
                                    )}
                                </div>

                                {/* Names */}
                                <div className="space-y-1 mb-6 flex-1 text-center">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                                        {sponsor.name_en}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium line-clamp-1">
                                        {sponsor.name_th}
                                    </p>
                                </div>

                                {/* Action Buttons / Links */}
                                <div className="flex flex-col w-full gap-2 mt-auto">
                                    {sponsor.website_url && (
                                        <a
                                            href={sponsor.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-2 px-3 bg-primary text-white rounded-[5px] text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                        >
                                            <Globe className="w-3.5 h-4" />
                                            Visit Website
                                        </a>
                                    )}
                                    {sponsor.contact_number && (
                                        <div className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-600 rounded-[5px] text-xs font-medium border border-slate-100">
                                            <Phone className="w-3.5 h-3.5" />
                                            {sponsor.contact_number}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
