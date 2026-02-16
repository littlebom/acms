'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Twitter, Globe, Mail, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Speaker {
    id: number;
    first_name: string;
    last_name: string;
    title?: string;
    email?: string;
    profile_image: string | null;
    bio: string | null;
    country?: string | null;
    organization?: string | null;
}

export function SpeakersList({ speakers }: { speakers: Speaker[] }) {
    if (!speakers || speakers.length === 0) {
        return (
            <div className="text-center py-24">
                <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
                    <Globe className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Speakers to be announced</h3>
                <p className="text-slate-500 mt-2">Check back soon for the lineup.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {speakers.map((speaker, index) => (
                <div
                    key={speaker.id}
                    className="group relative bg-white rounded-[5px] overflow-hidden border border-slate-100 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2"
                >
                    {/* Image Section */}
                    <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden">
                        {speaker.profile_image ? (
                            <img
                                src={speaker.profile_image}
                                alt={`${speaker.first_name} ${speaker.last_name}`}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white text-primary/20">
                                <span className="text-8xl font-black">{speaker.first_name[0]}</span>
                            </div>
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                        {/* Top Right Decorative & Social */}
                        <div className="absolute top-4 right-4 translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                            <div className="flex flex-col gap-2">
                                {speaker.email && (
                                    <Button size="icon" variant="secondary" className="h-10 w-10 rounded-full shadow-lg" asChild>
                                        <a href={`mailto:${speaker.email}`}>
                                            <Mail className="h-4 w-4 text-primary-foreground" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Bottom Content Area Over Image for "Poster style" */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="mb-1 overflow-hidden">
                                <p className="text-secondary font-semibold text-[10px] uppercase tracking-wider opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                    Keynote Speaker
                                </p>
                            </div>

                            <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-white transition-colors">
                                {speaker.title && <span className="font-normal text-slate-200">{speaker.title} </span>}
                                {speaker.first_name} <br />
                                <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{speaker.last_name}</span>
                            </h3>

                            {(speaker.organization || speaker.country) && (
                                <p className="text-xs text-slate-300 mb-2">
                                    {speaker.organization}{speaker.organization && speaker.country && ', '}{speaker.country}
                                </p>
                            )}

                            <div className="h-0 group-hover:h-auto group-hover:min-h-[60px] opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden text-xs text-slate-200 font-normal leading-relaxed">
                                {speaker.bio?.slice(0, 100) || "Expert in the field of Education Technology."}...
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar (Optional, simpler style) */}
                    <div className="p-4 bg-white border-t border-slate-50 flex justify-between items-center group-hover:border-secondary/20 transition-colors">
                        <span className="text-xs font-medium text-slate-400 group-hover:text-primary transition-colors flex items-center gap-2">
                            Learn more
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-secondary group-hover:text-primary-foreground transition-all duration-300">
                            <ArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
