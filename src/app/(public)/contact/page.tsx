import React from 'react';
import { getSystemSettings } from '@/app/actions/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Youtube, MessageCircle, MessageSquare } from 'lucide-react';

export default async function ContactPage() {
    const settings = await getSystemSettings();

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                        Contact <span className="text-primary">Us</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Get in touch with {settings.system_name || 'us'}
                    </p>
                </div>

                {/* Two-column layout */}
                <div className="grid md:grid-cols-2 gap-8 items-stretch">
                    {/* Left Column - Contact Information */}
                    <Card className="shadow-lg border-slate-100">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-slate-900">
                                {settings.system_name || 'Organization'}
                            </CardTitle>
                            {settings.description && (
                                <p className="text-sm text-slate-600">
                                    {settings.description}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Address */}
                            {settings.contact_address && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Address</h3>
                                        <p className="text-sm text-slate-600 leading-relaxed">{settings.contact_address}</p>
                                    </div>
                                </div>
                            )}

                            {/* Phone */}
                            {settings.contact_phone && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-50 rounded-lg flex-shrink-0">
                                        <Phone className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Phone</h3>
                                        <a
                                            href={`tel:${settings.contact_phone}`}
                                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                                        >
                                            {settings.contact_phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Email */}
                            {settings.contact_email && (
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-50 rounded-lg flex-shrink-0">
                                        <Mail className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Email</h3>
                                        <a
                                            href={`mailto:${settings.contact_email}`}
                                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                                        >
                                            {settings.contact_email}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Social Media */}
                            {(settings.social_facebook || settings.social_twitter || settings.social_linkedin || settings.social_youtube || settings.social_line || settings.social_whatsapp) && (
                                <>
                                    <Separator className="my-6" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-900 mb-4">Follow Us</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {settings.social_facebook && (
                                                <a
                                                    href={settings.social_facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    aria-label="Facebook"
                                                >
                                                    <Facebook className="h-5 w-5 text-blue-600" />
                                                </a>
                                            )}
                                            {settings.social_twitter && (
                                                <a
                                                    href={settings.social_twitter}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
                                                    aria-label="Twitter"
                                                >
                                                    <Twitter className="h-5 w-5 text-sky-600" />
                                                </a>
                                            )}
                                            {settings.social_linkedin && (
                                                <a
                                                    href={settings.social_linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                    aria-label="LinkedIn"
                                                >
                                                    <Linkedin className="h-5 w-5 text-blue-700" />
                                                </a>
                                            )}
                                            {settings.social_youtube && (
                                                <a
                                                    href={settings.social_youtube}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    aria-label="YouTube"
                                                >
                                                    <Youtube className="h-5 w-5 text-red-600" />
                                                </a>
                                            )}
                                            {settings.social_line && (
                                                <a
                                                    href={settings.social_line}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                    aria-label="Line"
                                                >
                                                    <MessageCircle className="h-5 w-5 text-green-600" />
                                                </a>
                                            )}
                                            {settings.social_whatsapp && (
                                                <a
                                                    href={settings.social_whatsapp}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                    aria-label="WhatsApp"
                                                >
                                                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Column - Google Map */}
                    {settings.contact_map_url ? (
                        <div className="relative rounded-lg overflow-hidden shadow-lg border border-slate-100 bg-white">
                            <iframe
                                src={settings.contact_map_url}
                                width="100%"
                                height="100%"
                                style={{ border: 0, position: 'absolute', inset: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Location Map"
                            ></iframe>
                        </div>
                    ) : (
                        <Card className="shadow-lg border-slate-100">
                            <CardContent className="flex items-center justify-center h-full">
                                <div className="text-center text-slate-400">
                                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Map location not configured</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
