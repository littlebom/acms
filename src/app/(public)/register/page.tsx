'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { register } from "@/app/actions/auth";
import { Loader2, Camera } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageCropper } from '@/components/admin/image-cropper';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                </>
            ) : (
                'Create Account'
            )}
        </Button>
    );
}

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);

    async function handleSubmit(formData: FormData) {
        setError(null);

        // Client-side validation
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        // If we have a cropped image, use it instead of the original
        if (croppedImageFile) {
            formData.delete('profileImage');
            formData.append('profileImage', croppedImageFile);
        }

        const result = await register(formData);
        if (result?.error) {
            setError(result.error);
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedImageFile(url);
            setCropperOpen(true); // Open cropper dialog
        }
    };

    const handleCropComplete = async (croppedImageUrl: string) => {
        // Convert base64 to File object
        const blob = await (await fetch(croppedImageUrl)).blob();
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

        setCroppedImageFile(file);
        setImagePreview(croppedImageUrl);
        setCropperOpen(false);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <Card className="w-[95%] sm:w-full max-w-3xl mx-auto border-slate-200 shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your information to get started
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-8">
                    <form action={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Profile Image Section - Topmost */}
                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-4 border-white shadow-md bg-slate-100">
                                    <AvatarImage src={imagePreview || undefined} className="object-cover object-top" />
                                    <AvatarFallback className="text-4xl text-slate-400 bg-slate-100">
                                        <Camera className="h-10 w-10 opacity-50" />
                                    </AvatarFallback>
                                </Avatar>
                                <label
                                    htmlFor="profileImage"
                                    className="absolute bottom-0 right-0 bg-white border rounded-full p-2 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    <Camera className="h-4 w-4 text-slate-600" />
                                    <input
                                        type="file"
                                        id="profileImage"
                                        name="profileImage"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Upload Profile Picture</p>
                        </div>

                        {/* Section: Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Account Information</h3>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                    <Input id="password" name="password" type="password" required minLength={6} />
                                    <p className="text-xs text-slate-500">Min. 6 characters</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                                </div>
                            </div>
                        </div>

                        {/* Section: Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Personal Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-1 space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Select name="title">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mr.">Mr.</SelectItem>
                                            <SelectItem value="Ms.">Ms.</SelectItem>
                                            <SelectItem value="Mrs.">Mrs.</SelectItem>
                                            <SelectItem value="Dr.">Dr.</SelectItem>
                                            <SelectItem value="Asst. Prof.">Asst. Prof.</SelectItem>
                                            <SelectItem value="Assoc. Prof.">Assoc. Prof.</SelectItem>
                                            <SelectItem value="Prof.">Prof.</SelectItem>
                                            <SelectItem value="Asst. Prof. Dr.">Asst. Prof. Dr.</SelectItem>
                                            <SelectItem value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</SelectItem>
                                            <SelectItem value="Prof. Dr.">Prof. Dr.</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-3 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First name <span className="text-red-500">*</span></Label>
                                        <Input id="firstName" name="firstName" placeholder="John" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last name <span className="text-red-500">*</span></Label>
                                        <Input id="lastName" name="lastName" placeholder="Doe" required />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select name="gender">
                                        <SelectTrigger>
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
                                    <Label htmlFor="birthYear">Birth Year</Label>
                                    <Input id="birthYear" name="birthYear" type="number" placeholder="YYYY" min="1900" max={new Date().getFullYear()} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Contact Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Phone Number</Label>
                                    <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="+1..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" name="country" placeholder="Thailand" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea id="address" name="address" placeholder="Full address" rows={3} />
                            </div>
                        </div>

                        {/* Section: Professional Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Professional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="educationLevel">Education Level</Label>
                                    <Select name="educationLevel">
                                        <SelectTrigger>
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
                                <div className="space-y-2">
                                    <Label htmlFor="occupation">Occupation</Label>
                                    <Input id="occupation" name="occupation" placeholder="Software Engineer" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="institution">Institution / Workplace</Label>
                                <Input id="institution" name="institution" placeholder="University Name or Company" />
                            </div>
                        </div>

                        <SubmitButton />
                    </form>

                    {/* Image Cropper Dialog */}
                    {selectedImageFile && (
                        <ImageCropper
                            imageUrl={selectedImageFile}
                            open={cropperOpen}
                            onClose={() => setCropperOpen(false)}
                            onCropComplete={handleCropComplete}
                            aspectRatio={3 / 4}
                        />
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm text-slate-500">
                    <div>
                        Already have an account?{" "}
                        <Link href="/login" className="text-indigo-600 font-medium hover:underline">
                            Sign In
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
