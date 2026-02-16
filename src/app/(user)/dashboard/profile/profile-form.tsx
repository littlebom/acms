'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Camera,
    Save,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    Calendar,
    Globe,
    User,
    Building2,
    Award,
    Ticket,
    Pencil
} from 'lucide-react';
import { updateUserDetails } from '@/app/actions/users';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ user, isReadOnly = false }: { user: any, isReadOnly?: boolean }) {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(user.profile_image);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        if (isReadOnly) return;

        setLoading(true);
        formData.append('user_id', user.id.toString());

        await updateUserDetails(formData);

        setLoading(false);
        router.refresh();
        // Optional: Redirect back to view page or show success toast
        // router.push(`/dashboard/profile/${user.id}`); 
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    return (
        <form action={handleSubmit} className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. Modern Hero Section (Editable) */}
            <div className="relative rounded-[0.2rem] overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-200 bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950">
                {/* Decorative Pattern */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                <div className="px-8 py-10 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                            <Avatar className="h-32 w-32 border-[4px] border-white/10 shadow-2xl relative bg-slate-800">
                                <AvatarImage src={imagePreview || undefined} className="object-cover" />
                                <AvatarFallback className="text-4xl font-bold text-white bg-slate-800">
                                    {user.first_name?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            {!isReadOnly && (
                                <label
                                    htmlFor="profile_image"
                                    className="absolute bottom-0 right-0 bg-white border-2 border-slate-900 rounded-full p-2 shadow-sm cursor-pointer hover:bg-slate-100 transition-colors z-20 group-hover:scale-110 duration-200 text-slate-900"
                                    title="Change Photo"
                                >
                                    <Camera className="h-4 w-4" />
                                    <input
                                        type="file"
                                        id="profile_image"
                                        name="profile_image"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                        disabled={loading}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Name & Actions (Editable) */}
                        <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4 w-full text-center md:text-left">
                            <div className="space-y-4 mb-1 w-full max-w-2xl">
                                <div className="flex flex-col md:flex-row items-center md:items-end gap-3 text-white">
                                    {/* Title Select */}
                                    <div className="w-24">
                                        <Select name="title" defaultValue={user.title || ''} disabled={isReadOnly || loading}>
                                            <SelectTrigger className="h-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-[0.2rem]">
                                                <SelectValue placeholder="Title" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Mr.">Mr.</SelectItem>
                                                <SelectItem value="Ms.">Ms.</SelectItem>
                                                <SelectItem value="Mrs.">Mrs.</SelectItem>
                                                <SelectItem value="Dr.">Dr.</SelectItem>
                                                <SelectItem value="Asst. Prof.">Asst. Prof.</SelectItem>
                                                <SelectItem value="Assoc. Prof.">Assoc. Prof.</SelectItem>
                                                <SelectItem value="Prof.">Prof.</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Name Inputs */}
                                    <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                                        <Input
                                            name="first_name"
                                            defaultValue={user.first_name}
                                            placeholder="First Name"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-[0.2rem] h-9 focus-visible:ring-blue-400"
                                            required
                                            disabled={isReadOnly || loading}
                                        />
                                        <Input
                                            name="last_name"
                                            defaultValue={user.last_name}
                                            placeholder="Last Name"
                                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-[0.2rem] h-9 focus-visible:ring-blue-400"
                                            required
                                            disabled={isReadOnly || loading}
                                        />
                                    </div>
                                </div>
                                <p className="text-lg text-blue-300 font-medium flex flex-wrap justify-center md:justify-start items-center gap-2">
                                    <span className="font-semibold">Conference Attendee</span>
                                    <span className="text-white/20">|</span>
                                    <span className="text-sm opacity-80">Editing Profile</span>
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 md:mb-1 shrink-0">
                                {!isReadOnly && (
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-white text-slate-900 hover:bg-slate-100 hover:text-blue-900 shadow-lg shadow-black/20 rounded-[0.2rem] px-6"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Personal Details Card */}
                    <Card className="shadow-sm border-slate-200 rounded-[0.2rem]">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                            <div className="flex items-center gap-3 text-slate-800 font-semibold">
                                <div className="p-2 bg-blue-100/50 text-blue-600 rounded-[0.2rem] border border-blue-100">
                                    <User className="h-4 w-4" />
                                </div>
                                Personal Details
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</Label>
                                <Select name="gender" defaultValue={user.gender || ''} disabled={isReadOnly || loading}>
                                    <SelectTrigger className="font-medium text-slate-900 rounded-[0.2rem]">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthYear" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Birth Year</Label>
                                <Input
                                    id="birthYear"
                                    name="birthYear"
                                    type="number"
                                    defaultValue={user.birth_year || ''}
                                    placeholder="YYYY"
                                    className="font-medium text-slate-900 rounded-[0.2rem]"
                                    disabled={isReadOnly || loading}
                                />
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-slate-50">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Member Since</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    <p className="text-slate-900 font-medium text-sm">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conference Registration Card (Static Info) */}
                    <Card className="shadow-sm border-slate-200 rounded-[0.2rem] overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                            <div className="flex items-center gap-3 text-slate-800 font-semibold">
                                <div className="p-2 bg-blue-100/50 text-blue-600 rounded-[0.2rem] border border-blue-100">
                                    <Ticket className="h-4 w-4" />
                                </div>
                                Conference Ticket
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-[0.2rem] border border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">Registration</span>
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 rounded-[0.2rem] px-2.5">
                                        Confirmed
                                    </Badge>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-400">Manage tickets in dashboard</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content (8 cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Bio Section */}
                    <Card className="relative shadow-md shadow-blue-100/50 border-slate-200 border-t-[4px] border-t-blue-800 rounded-[0.2rem]">
                        <CardHeader className="bg-white pt-6 pb-2">
                            <CardTitle className="flex items-center gap-3 text-xl">
                                <span className="p-2.5 bg-blue-50 text-blue-600 rounded-[0.2rem] border border-blue-100 flex items-center justify-center">
                                    <User className="h-5 w-5" />
                                </span>
                                About Me
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-8">
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={user.bio || ''}
                                placeholder="Write 2-3 sentences about yourself..."
                                rows={4}
                                className="resize-none font-sans text-lg leading-relaxed text-slate-900 rounded-[0.2rem]"
                                disabled={isReadOnly || loading}
                            />
                            <p className="text-xs text-slate-400 mt-2 text-right">Markdown supported</p>
                        </CardContent>
                    </Card>

                    {/* Contact Card */}
                    <Card className="shadow-sm border-slate-200 rounded-[0.2rem]">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                            <div className="flex items-center gap-3 text-slate-800 font-semibold">
                                <div className="p-2 bg-blue-100/50 text-blue-600 rounded-[0.2rem] border border-blue-100">
                                    <Phone className="h-4 w-4" />
                                </div>
                                Contact Information
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="col-span-full space-y-2">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Mail className="h-4 w-4" />
                                    <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider">Email</Label>
                                </div>
                                <Input id="email" defaultValue={user.email} disabled className="bg-slate-50 text-slate-500 border-slate-100 rounded-[0.2rem]" title="Email cannot be changed" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Phone className="h-4 w-4" />
                                    <Label htmlFor="phoneNumber" className="text-[11px] font-bold uppercase tracking-wider">Phone</Label>
                                </div>
                                <Input id="phoneNumber" name="phoneNumber" type="tel" defaultValue={user.phone_number || ''} placeholder="+66..." className="rounded-[0.2rem]" disabled={isReadOnly || loading} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Globe className="h-4 w-4" />
                                    <Label htmlFor="country" className="text-[11px] font-bold uppercase tracking-wider">Country</Label>
                                </div>
                                <Input id="country" name="country" defaultValue={user.country || ''} placeholder="Thailand" className="rounded-[0.2rem]" disabled={isReadOnly || loading} />
                            </div>

                            <div className="col-span-full space-y-2">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <MapPin className="h-4 w-4" />
                                    <Label htmlFor="address" className="text-[11px] font-bold uppercase tracking-wider">Address</Label>
                                </div>
                                <Textarea id="address" name="address" defaultValue={user.address || ''} rows={2} placeholder="Full address" className="rounded-[0.2rem] resize-none" disabled={isReadOnly || loading} />
                            </div>

                        </CardContent>
                    </Card>

                    {/* Professional & Education Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Work Experience */}
                        <Card className="shadow-sm border-slate-200 h-full flex flex-col rounded-[0.2rem]">
                            <CardHeader className="pb-3 border-b border-slate-50">
                                <CardTitle className="flex items-center gap-2 font-medium text-slate-500 text-sm uppercase tracking-wider">
                                    <Briefcase className="h-4 w-4 text-slate-400" />
                                    Experience
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 pt-5 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="occupation" className="font-bold text-slate-700">Position / Job Title</Label>
                                    <Input id="occupation" name="occupation" defaultValue={user.occupation || ''} placeholder="Ex. Software Engineer" className="rounded-[0.2rem]" disabled={isReadOnly || loading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="institution" className="font-bold text-slate-700">Company / Institution</Label>
                                    <Input id="institution" name="institution" defaultValue={user.institution || ''} placeholder="Ex. Tech Corp" className="rounded-[0.2rem]" disabled={isReadOnly || loading} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education */}
                        <Card className="shadow-sm border-slate-200 h-full flex flex-col rounded-[0.2rem]">
                            <CardHeader className="pb-3 border-b border-slate-50">
                                <CardTitle className="flex items-center gap-2 font-medium text-slate-500 text-sm uppercase tracking-wider">
                                    <GraduationCap className="h-4 w-4 text-slate-400" />
                                    Education
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 pt-5 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="educationLevel" className="font-bold text-slate-700">Highest Degree</Label>
                                    <Select name="educationLevel" defaultValue={user.education_level || ''} disabled={isReadOnly || loading}>
                                        <SelectTrigger className="rounded-[0.2rem]">
                                            <SelectValue placeholder="Select Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High School">High School</SelectItem>
                                            <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                                            <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                                            <SelectItem value="Doctorate">Doctorate</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-xs text-slate-400 p-2 bg-slate-50 rounded-[0.2rem]">
                                    Please select your highest level of education completed.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </form>
    );
}
