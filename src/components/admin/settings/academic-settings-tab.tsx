'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Settings2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface AcademicSettingsTabProps {
    settings: any;
    setSettings: (settings: any) => void;
}

export function AcademicSettingsTab({ settings, setSettings }: AcademicSettingsTabProps) {

    // Helper to handle date changes (input type="date" returns YYYY-MM-DD string)
    const handleDateChange = (field: string, value: string) => {
        setSettings({ ...settings, [field]: value });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        Conference Information
                    </CardTitle>
                    <CardDescription>
                        General settings for the academic paper submission system.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Global Conference Name Removed - Uses Active Event Name now */}

                    <div className="flex items-center justify-between space-x-2 border rounded-lg p-4 bg-slate-50">
                        <div className="space-y-0.5">
                            <Label className="text-base">Show Proceedings Menu</Label>
                            <p className="text-sm text-slate-500">
                                Enable public access to published proceedings via the "Proceedings" menu on the homepage.
                            </p>
                        </div>
                        <Switch
                            checked={settings.showProceedingsMenu || false}
                            onCheckedChange={(checked) => setSettings({ ...settings, showProceedingsMenu: checked })}
                        />
                    </div>

                    {settings.showProceedingsMenu && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                            <div className="grid gap-2">
                                <Label htmlFor="proceedingsTitle">Proceedings Page Title</Label>
                                <Input
                                    id="proceedingsTitle"
                                    value={settings.proceedingsTitle || ''}
                                    onChange={(e) => setSettings({ ...settings, proceedingsTitle: e.target.value })}
                                    placeholder="Proceedings & Archives"
                                />
                                <p className="text-[11px] text-slate-500">Overrides the default title "Proceedings & Archives".</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="proceedingsDescription">Proceedings Page Description</Label>
                                <Textarea
                                    id="proceedingsDescription"
                                    value={settings.proceedingsDescription || ''}
                                    onChange={(e) => setSettings({ ...settings, proceedingsDescription: e.target.value })}
                                    placeholder="Access published papers and conference proceedings from our events."
                                    rows={3}
                                />
                                <p className="text-[11px] text-slate-500">Overrides the default description text.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        Publisher & Metadata
                    </CardTitle>
                    <CardDescription>
                        Identity information for the proceedings or journal.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="publisherName">Publisher Name</Label>
                            <Input
                                id="publisherName"
                                value={settings.publisher_name || ''}
                                onChange={(e) => setSettings({ ...settings, publisher_name: e.target.value })}
                                placeholder="e.g. University Press"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="publisherAddress">Publisher Address</Label>
                            <Input
                                id="publisherAddress"
                                value={settings.publisher_address || ''}
                                onChange={(e) => setSettings({ ...settings, publisher_address: e.target.value })}
                                placeholder="City, Country"
                            />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="publicationIssn">ISSN / ISBN</Label>
                            <Input
                                id="publicationIssn"
                                value={settings.publication_issn || ''}
                                onChange={(e) => setSettings({ ...settings, publication_issn: e.target.value })}
                                placeholder="e.g. 1234-5678"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="publicationDoiPrefix">DOI Prefix</Label>
                            <Input
                                id="publicationDoiPrefix"
                                value={settings.publication_doi_prefix || ''}
                                onChange={(e) => setSettings({ ...settings, publication_doi_prefix: e.target.value })}
                                placeholder="e.g. 10.1000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="publicationLicense">License Text</Label>
                            <Input
                                id="publicationLicense"
                                value={settings.publication_license || ''}
                                onChange={(e) => setSettings({ ...settings, publication_license: e.target.value })}
                                placeholder="e.g. © 2026 ACMS"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-indigo-600" />
                        Review Process
                    </CardTitle>
                    <CardDescription>
                        Configure how the peer review system operates.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2 max-w-md">
                        <Label htmlFor="academicReviewType">Review Type</Label>
                        <Select
                            value={settings.academicReviewType || 'double_blind'}
                            onValueChange={(val) => setSettings({ ...settings, academicReviewType: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select review type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="double_blind">Double Blind (Both Anonymous)</SelectItem>
                                <SelectItem value="single_blind">Single Blind (Reviewer Anonymous)</SelectItem>
                                <SelectItem value="open">Open Review (Both Visible)</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-[11px] text-slate-500 pt-1">
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Double Blind:</strong> Authors don't know reviewers, Reviewers don't know authors.</li>
                                <li><strong>Single Blind:</strong> Authors don't know reviewers, Reviewers see author names.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
