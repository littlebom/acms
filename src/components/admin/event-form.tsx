'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateEvent, createEvent, type EventData } from "@/app/actions/events";
import { type Questionnaire } from "@/app/actions/questions";
import { type SpeakerGroup } from "@/app/actions/speakers";
import { type Schedule } from "@/app/actions/schedule";
import {
    Loader2, Save, FileText, ArrowLeft, Users, Calendar,
    MapPin, Globe, Clock, Layout, PenTool, CheckCircle,
    Link as LinkIcon, ExternalLink, ImageIcon, Upload, X, Youtube
} from "lucide-react";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { uploadImage } from "@/app/actions/upload";
import { useRef } from 'react';

function SubmitButton({ isCreate }: { isCreate: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm min-w-[140px]">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreate ? 'Creating...' : 'Saving...'}
                </>
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    {isCreate ? 'Create Event' : 'Save Changes'}
                </>
            )}
        </Button>
    );
}

// Helper to format date for input type="datetime-local"
function formatDateForInput(date: Date | null | string | undefined) {
    if (!date) return '';
    const d = new Date(date);
    return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function EventForm({
    initialData,
    questionnaires = [],
    speakerGroups = [],
    schedules = []
}: {
    initialData?: EventData | null,
    questionnaires?: Questionnaire[],
    speakerGroups?: SpeakerGroup[],
    schedules?: Schedule[]
}) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();
    const isCreate = !initialData?.id;
    const [description, setDescription] = useState(initialData?.description || '');

    // Image Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(initialData?.cover_image_url || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    async function handleSubmit(formData: FormData) {
        setMessage(null);

        // Upload Image if selected
        if (selectedFile) {
            const uploadData = new FormData();
            uploadData.append('file', selectedFile);
            try {
                const result = await uploadImage(uploadData);
                if (result.success && result.url) {
                    formData.set('cover_image_url', result.url);
                }
            } catch (err) {
                console.error("Upload failed", err);
                // Continue saving without new image or show error?
                // For now we continue, but user might lose the image intent.
            }
        } else if (!previewUrl) {
            // Explicitly set empty if removed
            formData.set('cover_image_url', '');
        } else {
            // Keep existing logic (if hidden input exists it works, otherwise need to append?)
            // If we don't have selectedFile, formData gets inputs. 
            // We need a hidden input for cover_image_url if it's existing.
            // Or we explicitly set it here
            formData.set('cover_image_url', previewUrl);
        }

        let result;
        if (isCreate) {
            result = await createEvent(formData);
        } else {
            result = await updateEvent(formData);
        }

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            if (isCreate) {
                router.push('/admin/conference/events');
            } else {
                setMessage({ type: 'success', text: 'Event settings updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            }
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-16">

            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-8 pt-2">
                <div className="flex items-center gap-4">
                    <Link href="/admin/conference/events">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100/80">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {isCreate ? 'New Event' : initialData?.name_en || 'Untitled Event'}
                            </h1>
                            {!isCreate && initialData && (
                                <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${initialData.is_active
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                    {initialData.is_active ? "Active" : "Archived"}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {isCreate ? 'Configure your new conference details.' : `Event ID: #${initialData?.id} • Last updated recently`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isCreate && (
                        <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                            <Link href={`/admin/conference/events/${initialData?.id}/preview`} target="_blank">
                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Preview
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <form action={handleSubmit}>
                {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
                {/* Keep slug hidden but populated */}
                <input type="hidden" name="slug" value={initialData?.slug || ''} />

                <Tabs defaultValue="general" className="space-y-8">

                    {/* Minimal Tabs List - Static */}
                    <div className="border-b border-slate-200 -mx-8 px-8 pt-1">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <TabsList className="h-12 bg-transparent p-0 gap-6">
                                <TabsTrigger
                                    value="general"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 h-full font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    General
                                </TabsTrigger>
                                <TabsTrigger
                                    value="resources"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 h-full font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Resources
                                </TabsTrigger>
                                <TabsTrigger
                                    value="registration"
                                    className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-1 h-full font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Registration
                                </TabsTrigger>
                            </TabsList>
                            <div className="py-2">
                                <SubmitButton isCreate={isCreate} />
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-12 gap-8">

                            {/* Left Column (8/12) */}
                            <div className="col-span-12 lg:col-span-8 space-y-8">

                                {/* 1. Essential Info */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-slate-800">Event Details</h2>
                                    </div>

                                    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                                        <CardContent className="p-6 space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name_en" className="text-slate-700 font-medium">Event Name (English)</Label>
                                                <Input
                                                    id="name_en"
                                                    name="name_en"
                                                    defaultValue={initialData?.name_en || ''}
                                                    required
                                                    className="text-lg py-5"
                                                    placeholder="The 5th International Conference on..."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="name_th" className="text-slate-600">Catchy Phrase (Theme)</Label>
                                                <Input
                                                    id="name_th"
                                                    name="name_th"
                                                    defaultValue={initialData?.name_th || ''}
                                                    placeholder="e.g. Innovating the Future..."
                                                />
                                            </div>



                                            <div className="space-y-2">
                                                <Label htmlFor="slug_display" className="text-slate-600">Permalink (Slug)</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="slug_display"
                                                        value={initialData?.slug || 'auto-generated'}
                                                        disabled
                                                        className="bg-slate-50 text-slate-500 pl-8"
                                                    />
                                                    <LinkIcon className="h-4 w-4 absolute left-2.5 top-3 text-slate-400" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="short_description" className="text-slate-700 font-medium">Short Description</Label>
                                                <Textarea
                                                    id="short_description"
                                                    name="short_description"
                                                    defaultValue={initialData?.short_description || ''}
                                                    rows={3}
                                                    maxLength={300}
                                                    className="resize-none leading-relaxed"
                                                    placeholder="A brief summary of the event (shown on cards and previews)..."
                                                />
                                                <div className="flex justify-between text-xs text-slate-400">
                                                    <span>Plain text only</span>
                                                    <span>Max 300 chars</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description" className="text-slate-700 font-medium">About the Event</Label>
                                                <input type="hidden" name="description" value={description} />
                                                <TiptapEditor
                                                    content={description}
                                                    onChange={setDescription}
                                                    placeholder="Describe the theme, goals, and target audience..."
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>

                                {/* 2. Contact & Location */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-lg font-semibold text-slate-800">Contact & Location</h2>
                                    </div>

                                    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                                        <CardContent className="p-6 space-y-6">
                                            {/* Venue & Map */}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="venue_name" className="text-slate-700">Venue Name</Label>
                                                    <Input
                                                        id="venue_name"
                                                        name="venue_name"
                                                        defaultValue={initialData?.venue_name || ''}
                                                        placeholder="e.g. Bangkok Convention Center..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="venue_map_url" className="text-slate-700">Google Maps Link</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="venue_map_url"
                                                            name="venue_map_url"
                                                            defaultValue={initialData?.venue_map_url || ''}
                                                            placeholder="https://maps.google.com/..."
                                                            className="pl-8"
                                                        />
                                                        <MapPin className="h-4 w-4 absolute left-2.5 top-3 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Full Address */}
                                            <div className="space-y-2">
                                                <Label htmlFor="address" className="text-slate-700">Full Address</Label>
                                                <Textarea
                                                    id="address"
                                                    name="address"
                                                    defaultValue={initialData?.address || ''}
                                                    rows={2}
                                                    placeholder="123 Road, District, Province, 10xxx"
                                                    className="resize-none"
                                                />
                                            </div>

                                            <Separator />

                                            {/* Contact Info */}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="contact_phone" className="text-slate-700">Phone Number</Label>
                                                    <Input
                                                        id="contact_phone"
                                                        name="contact_phone"
                                                        defaultValue={initialData?.contact_phone || ''}
                                                        placeholder="02-123-4567"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="contact_email" className="text-slate-700">Email Address</Label>
                                                    <Input
                                                        id="contact_email"
                                                        name="contact_email"
                                                        type="email"
                                                        defaultValue={initialData?.contact_email || ''}
                                                        placeholder="info@conference.com"
                                                    />
                                                </div>
                                            </div>

                                            {/* Social Media */}
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="social_facebook" className="text-slate-600 text-xs uppercase font-semibold">Facebook</Label>
                                                    <Input
                                                        id="social_facebook"
                                                        name="social_facebook"
                                                        defaultValue={initialData?.social_facebook || ''}
                                                        placeholder="Page URL or Name"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="social_line" className="text-slate-600 text-xs uppercase font-semibold">LINE ID</Label>
                                                    <Input
                                                        id="social_line"
                                                        name="social_line"
                                                        defaultValue={initialData?.social_line || ''}
                                                        placeholder="@eventname"
                                                        className="text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="social_website" className="text-slate-600 text-xs uppercase font-semibold">Website</Label>
                                                    <Input
                                                        id="social_website"
                                                        name="social_website"
                                                        defaultValue={initialData?.social_website || ''}
                                                        placeholder="https://..."
                                                        className="text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>
                            </div>

                            {/* Right Column (4/12) */}
                            <div className="col-span-12 lg:col-span-4 space-y-6">

                                {/* Timeline Card */}
                                <Card className="border-0 shadow-md ring-1 ring-slate-200 overflow-hidden bg-white">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        <h3 className="font-semibold text-slate-900">Event Timeline</h3>
                                    </div>
                                    <CardContent className="p-0">
                                        <div className="p-5 space-y-5">
                                            <div className="grid gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Starts</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        id="start_date"
                                                        name="start_date"
                                                        defaultValue={formatDateForInput(initialData?.start_date)}
                                                        className="border-slate-200 focus:border-purple-500"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-slate-500 uppercase">Ends</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        id="end_date"
                                                        name="end_date"
                                                        defaultValue={formatDateForInput(initialData?.end_date)}
                                                        className="border-slate-200 focus:border-purple-500"
                                                    />
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                                    <FileText className="h-3.5 w-3.5 text-blue-600" /> Academic Papers
                                                </h4>

                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Proceedings Name</Label>
                                                    <Input
                                                        id="proceedings_name"
                                                        name="proceedings_name"
                                                        defaultValue={initialData?.proceedings_name || ''}
                                                        placeholder={`Proceedings of the ${initialData?.name_en || '...'}`}
                                                        className="h-9 text-xs border-indigo-100 focus:border-indigo-500 bg-indigo-50/30"
                                                    />
                                                    <p className="text-[10px] text-slate-400">Optional. Overrides the default "Proceedings of [Event Name]" banner title.</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submission Deadline</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            id="submission_deadline"
                                                            name="submission_deadline"
                                                            defaultValue={formatDateForInput(initialData?.submission_deadline)}
                                                            className="h-9 text-xs border-blue-100 focus:border-blue-500 bg-blue-50/30"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Review Deadline</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            id="review_deadline"
                                                            name="review_deadline"
                                                            defaultValue={formatDateForInput(initialData?.review_deadline)}
                                                            className="h-9 text-xs border-amber-100 focus:border-amber-500 bg-amber-50/30"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 pt-2">
                                                    <div className="space-y-1.5">
                                                        <h4 className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                                            <Users className="h-3.5 w-3.5 text-green-600" /> Registration (Attendees)
                                                        </h4>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opens</Label>
                                                            <Input
                                                                type="datetime-local"
                                                                id="registration_start_date"
                                                                name="registration_start_date"
                                                                defaultValue={formatDateForInput(initialData?.registration_start_date)}
                                                                className="h-9 text-xs border-green-100 focus:border-green-500 bg-green-50/30"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Closes</Label>
                                                            <Input
                                                                type="datetime-local"
                                                                id="registration_deadline"
                                                                name="registration_deadline"
                                                                defaultValue={formatDateForInput(initialData?.registration_deadline)}
                                                                className="h-9 text-xs border-green-100 focus:border-green-500 bg-green-50/30"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-xs text-slate-500 text-center">
                                        Times are in server local time
                                    </div>
                                </Card>

                                {/* Cover Image Card */}
                                <Card className="border-0 shadow-md ring-1 ring-slate-200 overflow-hidden bg-white">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-pink-600" />
                                        <h3 className="font-semibold text-slate-900">Cover Image</h3>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <input type="hidden" name="cover_image_url" value={previewUrl} />
                                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                {previewUrl ? (
                                                    <div className="relative rounded-lg overflow-hidden shadow-sm inline-block group w-full">
                                                        <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover rounded-md" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-full shadow-md"
                                                                onClick={handleRemoveImage}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6" onClick={() => fileInputRef.current?.click()}>
                                                        <div className="bg-white p-2.5 rounded-full shadow-sm inline-flex mb-3">
                                                            <ImageIcon className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                        <div className="text-sm font-medium text-slate-900">Upload Image</div>
                                                        <p className="text-xs text-slate-500 mt-1 mb-3">1920x1080 recommended</p>
                                                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}>
                                                            Select File
                                                        </Button>
                                                    </div>
                                                )}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 text-center">
                                                Displayed on the homepage "About" section.
                                            </p>

                                            <Separator className="my-4" />

                                            <div className="space-y-2">
                                                <Label htmlFor="youtube_url" className="text-slate-700 font-medium flex items-center gap-2">
                                                    <Youtube className="h-4 w-4 text-red-600" />
                                                    YouTube Video URL
                                                </Label>
                                                <Input
                                                    id="youtube_url"
                                                    name="youtube_url"
                                                    defaultValue={initialData?.youtube_url || ''}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    className="text-sm"
                                                />
                                                <p className="text-[10px] text-slate-500">
                                                    Shown as a play button overlay on the home page's About section.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Stats / Info */}
                                {!isCreate && (
                                    <div className="bg-indigo-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Calendar className="h-24 w-24" />
                                        </div>
                                        <h3 className="font-semibold text-lg relative z-10">Quick Status</h3>
                                        <div className="mt-4 space-y-3 relative z-10">
                                            <div className="flex justify-between items-center text-indigo-100 text-sm border-b border-indigo-800 pb-2">
                                                <span>Event ID</span>
                                                <span className="font-mono">{initialData?.id}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-indigo-100 text-sm border-b border-indigo-800 pb-2">
                                                <span>Visibility</span>
                                                <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-0">
                                                    {initialData?.is_active ? 'Public' : 'Hidden'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Resources Tab */}
                    <TabsContent value="resources" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content Connections</CardTitle>
                                    <CardDescription>Link external modules like Speakers and Schedules to this event.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3 p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="h-5 w-5 text-indigo-600" />
                                                <Label className="text-base font-medium">Speaker Group</Label>
                                            </div>
                                            <Select
                                                name="speaker_group_id"
                                                defaultValue={initialData?.speaker_group_id?.toString() || 'none'}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select group..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Disconnected --</SelectItem>
                                                    {speakerGroups.map(g => (
                                                        <SelectItem key={g.id} value={g.id.toString()}>
                                                            {g.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-slate-500">Defines the pool of speakers displayed on the event page.</p>
                                        </div>

                                        <div className="space-y-3 p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Layout className="h-5 w-5 text-emerald-600" />
                                                <Label className="text-base font-medium">Schedule Template</Label>
                                            </div>
                                            <Select
                                                name="schedule_id"
                                                defaultValue={initialData?.schedule_id?.toString() || 'none'}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select schedule..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Disconnected --</SelectItem>
                                                    {schedules.map(s => (
                                                        <SelectItem key={s.id} value={s.id.toString()}>
                                                            {s.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-slate-500">Determines the sessions and timeline view.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Registration Tab */}
                    <TabsContent value="registration" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="max-w-4xl mx-auto">
                            <Card className="border-l-4 border-l-blue-600">
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-1">
                                        <PenTool className="h-5 w-5 text-blue-600" />
                                        <CardTitle>Registration Logic</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Configure the data collection form for attendees.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-2">
                                                <Label>Entry Questionnaire</Label>
                                                <Select
                                                    name="registration_form_id"
                                                    defaultValue={initialData?.registration_form_id?.toString() || 'none'}
                                                >
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="Select questionnaire..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">-- No Exta Questions --</SelectItem>
                                                        {questionnaires.map(q => (
                                                            <SelectItem key={q.id} value={q.id.toString()}>
                                                                {q.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Alert className="bg-blue-50 border-blue-100 text-blue-900">
                                                <AlertTitle className="text-sm font-semibold">How this works</AlertTitle>
                                                <AlertDescription className="text-xs mt-1 text-blue-800">
                                                    When users click "Register", they will be asked standard account questions plus any custom questions defined in the selected questionnaire.
                                                </AlertDescription>
                                            </Alert>
                                        </div>

                                        <div className="w-full md:w-64 bg-slate-50 rounded-lg p-4 border border-slate-200">
                                            <h4 className="font-semibold text-sm mb-2 text-slate-700">Preview Flow</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">1</span>
                                                    User Logs In
                                                </div>
                                                <div className="h-3 w-0.5 bg-slate-200 mx-2"></div>
                                                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                                                    <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">2</span>
                                                    Answers Questionnaire
                                                </div>
                                                <div className="h-3 w-0.5 bg-slate-200 mx-2"></div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">3</span>
                                                    Payment / Payment Slip
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {message && (
                    <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${message.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}`}>
                        {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-400" /> : <Loader2 className="h-5 w-5" />}
                        <div>
                            <p className="font-semibold">{message.type === 'success' ? 'Saved Successfully' : 'Error'}</p>
                            <p className="text-xs opacity-90">{message.text}</p>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
