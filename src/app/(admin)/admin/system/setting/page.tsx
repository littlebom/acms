'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Palette, Layout, CreditCard, Save, Mail, Eye, EyeOff } from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '@/app/actions/settings';
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { AcademicSettingsTab } from "@/components/admin/settings/academic-settings-tab";
import { PaymentSettingsTab } from "@/components/admin/settings/payment-settings-tab";

export default function AdminSettingPage() {
    const [loading, setLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Mock initial data
    const [settings, setSettings] = useState({
        systemName: "ACMS 2025",
        description: "Official Conference Management System",
        primaryColor: "#2D4391",
        secondaryColor: "#4FDB90",
        badgeSize: "8.6x5.4",
        logo: "",
        contactPhone: "",
        contactEmail: "",
        contactAddress: "",
        contactMapUrl: "",
        socialFacebook: "",
        socialTwitter: "",
        socialLinkedin: "",
        socialYoutube: "",
        socialLine: "",
        socialWhatsapp: ""
    });

    // SMTP Settings
    const [smtpSettings, setSmtpSettings] = useState({
        smtpHost: "smtp.gmail.com",
        smtpPort: "587",
        smtpUser: "",
        smtpPassword: "",
        smtpFromEmail: "",
        smtpFromName: "ACMS Conference",
        smtpSecure: "tls"
    });
    const [showPassword, setShowPassword] = useState(false);

    // Academic Settings
    const [academicSettings, setAcademicSettings] = useState({
        academicConferenceName: "",
        academicSubmissionDeadline: "",
        academicReviewDeadline: "",
        academicReviewType: "double_blind",
        showProceedingsMenu: false,
        proceedingsTitle: "",
        proceedingsDescription: ""
    });

    // Payment Settings
    const [paymentSettings, setPaymentSettings] = useState({
        omisePublicKey: "",
        omiseSecretKey: "",
        omiseEnabled: false,
        stripePublishableKey: "",
        stripeSecretKey: "",
        stripeEnabled: false,
        paymentCurrency: "THB"
    });

    // Load initial settings
    useEffect(() => {
        async function loadSettings() {
            const data = await getSystemSettings();
            setSettings({
                systemName: data.system_name || "ACMS 2025",
                description: data.description || "Official Conference Management System",
                primaryColor: data.primary_color || "#2D4391",
                secondaryColor: data.secondary_color || "#4FDB90",
                badgeSize: data.badge_size || "8.6x5.4",
                logo: data.logo_url || "",
                contactPhone: data.contact_phone || "",
                contactEmail: data.contact_email || "",
                contactAddress: data.contact_address || "",
                contactMapUrl: data.contact_map_url || "",
                socialFacebook: data.social_facebook || "",
                socialTwitter: data.social_twitter || "",
                socialLinkedin: data.social_linkedin || "",
                socialYoutube: data.social_youtube || "",
                socialLine: data.social_line || "",
                socialWhatsapp: data.social_whatsapp || ""
            });
            // Load SMTP settings
            setSmtpSettings({
                smtpHost: data.smtp_host || "smtp.gmail.com",
                smtpPort: data.smtp_port || "587",
                smtpUser: data.smtp_user || "",
                smtpPassword: data.smtp_password || "",
                smtpFromEmail: data.smtp_from_email || "",
                smtpFromName: data.smtp_from_name || "ACMS Conference",
                smtpSecure: data.smtp_secure || "tls"
            });
            // Load Academic settings
            setAcademicSettings({
                academicConferenceName: data.academic_conference_name || "",
                academicSubmissionDeadline: data.academic_submission_deadline ? new Date(data.academic_submission_deadline).toISOString().split('T')[0] : "",
                academicReviewDeadline: data.academic_review_deadline ? new Date(data.academic_review_deadline).toISOString().split('T')[0] : "",
                academicReviewType: (data.academic_review_type as any) || "double_blind",
                showProceedingsMenu: data.show_proceedings_menu || false,
                proceedingsTitle: data.proceedings_title || "",
                proceedingsDescription: data.proceedings_description || ""
            });
            // Load Payment settings
            setPaymentSettings({
                omisePublicKey: data.omise_public_key || "",
                omiseSecretKey: data.omise_secret_key || "",
                omiseEnabled: data.omise_enabled || false,
                stripePublishableKey: data.stripe_publishable_key || "",
                stripeSecretKey: data.stripe_secret_key || "",
                stripeEnabled: data.stripe_enabled || false,
                paymentCurrency: data.payment_currency || "THB"
            });
        }
        loadSettings();
    }, []);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setLogoPreview(url);
            // logic to upload file
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const result = await updateSystemSettings({
                badge_size: settings.badgeSize as any,
                system_name: settings.systemName,
                description: settings.description,
                primary_color: settings.primaryColor,
                secondary_color: settings.secondaryColor,
                logo_url: settings.logo,
                contact_phone: settings.contactPhone,
                contact_email: settings.contactEmail,
                contact_address: settings.contactAddress,
                contact_map_url: settings.contactMapUrl,
                social_facebook: settings.socialFacebook,
                social_twitter: settings.socialTwitter,
                social_linkedin: settings.socialLinkedin,
                social_youtube: settings.socialYoutube,
                social_line: settings.socialLine,
                social_whatsapp: settings.socialWhatsapp,
                // SMTP Settings
                smtp_host: smtpSettings.smtpHost,
                smtp_port: smtpSettings.smtpPort,
                smtp_user: smtpSettings.smtpUser,
                smtp_password: smtpSettings.smtpPassword,
                smtp_from_email: smtpSettings.smtpFromEmail,
                smtp_from_name: smtpSettings.smtpFromName,

                smtp_secure: smtpSettings.smtpSecure,
                // Academic Settings
                academic_conference_name: academicSettings.academicConferenceName,
                academic_submission_deadline: academicSettings.academicSubmissionDeadline ? new Date(academicSettings.academicSubmissionDeadline) : undefined,
                academic_review_deadline: academicSettings.academicReviewDeadline ? new Date(academicSettings.academicReviewDeadline) : undefined,
                academic_review_type: academicSettings.academicReviewType as any,
                show_proceedings_menu: (academicSettings as any).showProceedingsMenu,
                proceedings_title: (academicSettings as any).proceedingsTitle,
                proceedings_description: (academicSettings as any).proceedingsDescription,
                // Payment Settings
                omise_public_key: paymentSettings.omisePublicKey,
                omise_secret_key: paymentSettings.omiseSecretKey,
                omise_enabled: paymentSettings.omiseEnabled,
                stripe_publishable_key: paymentSettings.stripePublishableKey,
                stripe_secret_key: paymentSettings.stripeSecretKey,
                stripe_enabled: paymentSettings.stripeEnabled,
                payment_currency: paymentSettings.paymentCurrency,
            });

            if (result.success) {
                alert("Settings saved successfully!");
            } else {
                alert("Failed to save settings: " + (result.error || "Unknown error"));
            }
        } catch (error) {
            console.error('Save error:', error);
            alert("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminPageContainer maxWidth="5xl">
            <AdminPageHeader
                title="System Settings"
                description="Manage general system configuration, branding, and output preferences."
            />

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-5 max-w-3xl mb-8">
                    <TabsTrigger value="general">General & Branding</TabsTrigger>
                    <TabsTrigger value="badges">Badge & Tickets</TabsTrigger>
                    <TabsTrigger value="smtp">SMTP Server</TabsTrigger>
                    <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
                    <TabsTrigger value="academic">Academic Papers</TabsTrigger>
                </TabsList>

                {/* 1. General & Branding Tab */}
                <TabsContent value="general" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

                    {/* System Identity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layout className="h-5 w-5 text-blue-600" />
                                System Identity
                            </CardTitle>
                            <CardDescription>
                                Configure the basic details of the conference application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="systemName">System Name</Label>
                                <Input
                                    id="systemName"
                                    defaultValue={settings.systemName}
                                    onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                                    placeholder="e.g. ACMS 2025"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    defaultValue={settings.description}
                                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                                    placeholder="Platform description"
                                />
                            </div>

                            <Separator />

                            {/* Contact Information */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">Phone Number</Label>
                                    <Input
                                        id="contactPhone"
                                        defaultValue={settings.contactPhone}
                                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                        placeholder="+66 2 123 4567"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        defaultValue={settings.contactEmail}
                                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                        placeholder="contact@conference.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contactAddress">Address</Label>
                                <Input
                                    id="contactAddress"
                                    defaultValue={settings.contactAddress}
                                    onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                                    placeholder="Building, Street, City, Country"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="contactMapUrl">Google Map Embed URL</Label>
                                <div className="space-y-4">
                                    <Input
                                        id="contactMapUrl"
                                        value={settings.contactMapUrl}
                                        onChange={(e) => setSettings({ ...settings, contactMapUrl: e.target.value })}
                                        placeholder="https://www.google.com/maps/embed?pb=..."
                                        className="font-mono text-xs"
                                    />
                                    {settings.contactMapUrl && (
                                        <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video w-full bg-slate-50">
                                            <iframe
                                                src={settings.contactMapUrl}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        </div>
                                    )}
                                    <p className="text-[11px] text-slate-500">
                                        Go to Google Maps {'>'} Share {'>'} Embed a map {'>'} Copy the URL from the iframe src attribute
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Social Media */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Social Media Links</h4>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="socialFacebook" className="text-xs text-slate-500">Facebook URL</Label>
                                        <Input
                                            id="socialFacebook"
                                            defaultValue={settings.socialFacebook}
                                            onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                                            placeholder="https://facebook.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="socialTwitter" className="text-xs text-slate-500">X (Twitter) URL</Label>
                                        <Input
                                            id="socialTwitter"
                                            defaultValue={settings.socialTwitter}
                                            onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                                            placeholder="https://x.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="socialLinkedin" className="text-xs text-slate-500">LinkedIn URL</Label>
                                        <Input
                                            id="socialLinkedin"
                                            defaultValue={settings.socialLinkedin}
                                            onChange={(e) => setSettings({ ...settings, socialLinkedin: e.target.value })}
                                            placeholder="https://linkedin.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="socialYoutube" className="text-xs text-slate-500">YouTube URL</Label>
                                        <Input
                                            id="socialYoutube"
                                            defaultValue={settings.socialYoutube}
                                            onChange={(e) => setSettings({ ...settings, socialYoutube: e.target.value })}
                                            placeholder="https://youtube.com/@..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="socialLine" className="text-xs text-slate-500">Line URL</Label>
                                        <Input
                                            id="socialLine"
                                            defaultValue={settings.socialLine}
                                            onChange={(e) => setSettings({ ...settings, socialLine: e.target.value })}
                                            placeholder="https://line.me/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="socialWhatsapp" className="text-xs text-slate-500">WhatsApp URL</Label>
                                        <Input
                                            id="socialWhatsapp"
                                            defaultValue={settings.socialWhatsapp}
                                            onChange={(e) => setSettings({ ...settings, socialWhatsapp: e.target.value })}
                                            placeholder="https://wa.me/..."
                                        />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Logo & Branding */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5 text-purple-600" />
                                Logo & Branding
                            </CardTitle>
                            <CardDescription>
                                Upload system logo and define brand colors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Logo Upload */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center w-40 h-40 bg-slate-50 relative overflow-hidden group hover:border-blue-400 transition-colors">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <span className="text-xs">No Logo</span>
                                        </div>
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-medium text-sm">System Logo</h4>
                                    <p className="text-xs text-slate-500">
                                        Recommended size: 512x512px. Supports PNG, JPG.
                                        <br />This logo will appear on the sidebar and login screen.
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                                        <Upload className="h-3.5 w-3.5 mr-2" />
                                        Upload New Logo
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Color Theme */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label>Primary Color (Brand)</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-md border shadow-sm" style={{ backgroundColor: settings.primaryColor }}></div>
                                        <Input
                                            type="text"
                                            value={settings.primaryColor}
                                            onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                            className="font-mono"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400">Used for buttons, headers, and active states.</p>
                                </div>
                                <div className="space-y-3">
                                    <Label>Secondary Color (Accent)</Label>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-md border shadow-sm" style={{ backgroundColor: settings.secondaryColor }}></div>
                                        <Input
                                            type="text"
                                            value={settings.secondaryColor}
                                            onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                            className="font-mono"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400">Used for highlights, badges, and creative elements.</p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 2. Badge & Ticket Tab */}
                <TabsContent value="badges" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-emerald-600" />
                                Badge Configuration
                            </CardTitle>
                            <CardDescription>
                                Define the dimensions and layout for the automatic attendee badges.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="grid gap-4 max-w-lg">
                                <div className="space-y-2">
                                    <Label>Default Badge Size</Label>
                                    <Select
                                        defaultValue={settings.badgeSize}
                                        onValueChange={(val) => setSettings({ ...settings, badgeSize: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="8.6x5.4">8.6 x 5.4 cm (Landscape - Credit Card)</SelectItem>
                                            <SelectItem value="5.4x8.6">5.4 x 8.6 cm (Portrait - Credit Card)</SelectItem>
                                            <SelectItem value="8x12">8 x 12 cm (Portrait - Vertical Pass)</SelectItem>
                                            <SelectItem value="12x8">12 x 8 cm (Landscape - Horizontal Pass)</SelectItem>
                                            <SelectItem value="9x13">9 x 13 cm (Portrait - Conference Standard)</SelectItem>
                                            <SelectItem value="13x9">13 x 9 cm (Landscape - Conference Standard)</SelectItem>
                                            <SelectItem value="10x14">10 x 14 cm (Portrait - Extra Large)</SelectItem>
                                            <SelectItem value="14x10">14 x 10 cm (Landscape - Extra Large)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500 pt-1">
                                        This selection will determine the PDF output size and image aspect ratio for all tickets/badges.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50/50 border rounded-md flex flex-col md:flex-row gap-6 items-center">
                                {/* Visual Mockup of Badge Size */}
                                <div
                                    className="bg-white border-2 border-slate-300 shadow-sm relative flex items-center justify-center text-slate-300 text-xs font-mono transition-all duration-300"
                                    style={{
                                        width: settings.badgeSize === '8.6x5.4' ? '172px' : settings.badgeSize === '8x12' ? '160px' : settings.badgeSize === '9x13' ? '180px' : '200px',
                                        height: settings.badgeSize === '8.6x5.4' ? '108px' : settings.badgeSize === '8x12' ? '240px' : settings.badgeSize === '9x13' ? '260px' : '280px',
                                    }}
                                >
                                    <div className="absolute top-2 w-full text-center font-bold text-slate-900/20 px-2 truncate">ACMS CONF</div>
                                    <span>Preview</span>
                                    <Badge className="absolute bottom-2 bg-slate-100 text-slate-500 border-slate-200">Attendee</Badge>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p><span className="font-semibold text-slate-900">Selected:</span> {settings.badgeSize === '8.6x5.4' && 'Credit Card Size'}
                                        {settings.badgeSize === '8x12' && 'Vertical Pass'}
                                        {settings.badgeSize === '9x13' && 'Medium Event Badge'}
                                        {settings.badgeSize === '10x14' && 'Large Event Badge'}</p>

                                    <p>Suitable for standard lanyards and holders.</p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 3. SMTP Server Tab */}
                <TabsContent value="smtp" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-orange-600" />
                                SMTP Server Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure email sending via SMTP. For Gmail, use App Passwords instead of your regular password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Server Settings */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpHost">SMTP Host</Label>
                                    <Input
                                        id="smtpHost"
                                        value={smtpSettings.smtpHost}
                                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })}
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPort">SMTP Port</Label>
                                    <Input
                                        id="smtpPort"
                                        value={smtpSettings.smtpPort}
                                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
                                        placeholder="587"
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Authentication */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-slate-700">Authentication</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpUser">Username / Email</Label>
                                        <Input
                                            id="smtpUser"
                                            type="email"
                                            value={smtpSettings.smtpUser}
                                            onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpUser: e.target.value })}
                                            placeholder="your-email@gmail.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPassword">Password / App Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="smtpPassword"
                                                type={showPassword ? "text" : "password"}
                                                value={smtpSettings.smtpPassword}
                                                onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPassword: e.target.value })}
                                                placeholder="••••••••••••••••"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            For Gmail: Use <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener" className="text-blue-600 hover:underline">App Password</a> (16 characters, no spaces)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* From Settings */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-slate-700">Sender Information</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpFromEmail">From Email</Label>
                                        <Input
                                            id="smtpFromEmail"
                                            type="email"
                                            value={smtpSettings.smtpFromEmail}
                                            onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpFromEmail: e.target.value })}
                                            placeholder="noreply@conference.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpFromName">From Name</Label>
                                        <Input
                                            id="smtpFromName"
                                            value={smtpSettings.smtpFromName}
                                            onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpFromName: e.target.value })}
                                            placeholder="ACMS Conference"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Security */}
                            <div className="space-y-2 max-w-xs">
                                <Label>Security / Encryption</Label>
                                <Select
                                    value={smtpSettings.smtpSecure}
                                    onValueChange={(val) => setSmtpSettings({ ...smtpSettings, smtpSecure: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select security type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tls">TLS (Port 587) - Recommended</SelectItem>
                                        <SelectItem value="ssl">SSL (Port 465)</SelectItem>
                                        <SelectItem value="none">None (Port 25) - Not Recommended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Gmail Help Box */}
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                                <h5 className="font-medium text-amber-800 text-sm mb-2">📧 Gmail SMTP Setup</h5>
                                <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                                    <li>Host: <code className="bg-amber-100 px-1 rounded">smtp.gmail.com</code></li>
                                    <li>Port: <code className="bg-amber-100 px-1 rounded">587</code> (TLS) or <code className="bg-amber-100 px-1 rounded">465</code> (SSL)</li>
                                    <li>Enable 2-Step Verification on your Google Account</li>
                                    <li>Create an App Password at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Google App Passwords</a></li>
                                    <li>Use the 16-character App Password (without spaces)</li>
                                </ul>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>


                {/* 4. Payment Gateway Tab */}
                <TabsContent value="payment">
                    <PaymentSettingsTab settings={paymentSettings} setSettings={setPaymentSettings} />
                </TabsContent>

                {/* 5. Academic Papers Tab */}
                <TabsContent value="academic">
                    <AcademicSettingsTab settings={academicSettings} setSettings={setAcademicSettings} />
                </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSave} disabled={loading} className="px-8 bg-blue-900 hover:bg-blue-800">
                    {loading ? "Saving..." : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Configuration
                        </>
                    )}
                </Button>
            </div>
        </AdminPageContainer >
    );
}
