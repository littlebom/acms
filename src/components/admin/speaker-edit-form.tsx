'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Camera, ArrowLeft } from 'lucide-react';
import { type SpeakerGroupMember, updateSpeakerDetails } from '@/app/actions/speakers';
import { ImageCropper } from '@/components/admin/image-cropper';

export function SpeakerEditForm({
    speaker,
    groupId
}: {
    speaker: SpeakerGroupMember,
    groupId: number
}) {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(speaker.profile_image);
    const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('user_id', speaker.user_id.toString());
        formData.append('group_id', groupId.toString());

        // If we have a cropped image, use it instead of the original
        if (croppedImageFile) {
            formData.delete('profile_image');
            formData.append('profile_image', croppedImageFile);
        }

        await updateSpeakerDetails(formData);

        setLoading(false);
        router.push(`/admin/speakers/${groupId}`);
        router.refresh();
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
        const file = new File([blob], 'speaker-profile.jpg', { type: 'image/jpeg' });

        setCroppedImageFile(file);
        setImagePreview(croppedImageUrl);
        setCropperOpen(false);
    };

    return (
        <div className="space-y-6">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <form action={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                    {/* Left Column - Large Image */}
                    <div className="lg:col-span-1 bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex flex-col items-center justify-start border-r border-slate-200">
                        <div className="w-full max-w-sm space-y-6">
                            <div className="relative group w-full" style={{ aspectRatio: '3/4' }}>
                                <div className="w-full h-full border-4 border-white shadow-lg rounded-lg overflow-hidden bg-slate-200">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Speaker profile"
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500">
                                            <span className="text-6xl font-bold">{speaker.first_name[0]}</span>
                                        </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="profile_image"
                                    className="absolute bottom-4 right-4 bg-white border-2 border-slate-300 rounded-full p-3 shadow-lg cursor-pointer hover:bg-slate-50 transition-colors"
                                >
                                    <Camera className="h-5 w-5 text-slate-600" />
                                    <input
                                        type="file"
                                        id="profile_image"
                                        name="profile_image"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {(speaker as any).title && <span className="text-slate-600 text-lg">{(speaker as any).title} </span>}
                                    {speaker.first_name} {speaker.last_name}
                                </h3>
                                {(speaker as any).organization && (
                                    <p className="text-sm text-slate-600">{(speaker as any).organization}</p>
                                )}
                                {(speaker as any).country && (
                                    <p className="text-sm text-slate-500">{(speaker as any).country}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Fields */}
                    <div className="lg:col-span-2 p-8 space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900 mb-1">Speaker Information</h2>
                            <p className="text-sm text-slate-500">Update the speaker's profile details</p>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="space-y-2 col-span-3">
                                <Label htmlFor="title">Title</Label>
                                <select
                                    id="title"
                                    name="title"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue={(speaker as any).title || ''}
                                >
                                    <option value="">None</option>
                                    <option value="Prof. Dr.">Prof. Dr.</option>
                                    <option value="Prof.">Prof.</option>
                                    <option value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</option>
                                    <option value="Assoc. Prof.">Assoc. Prof.</option>
                                    <option value="Asst. Prof. Dr.">Asst. Prof. Dr.</option>
                                    <option value="Asst. Prof.">Asst. Prof.</option>
                                    <option value="Dr.">Dr.</option>
                                    <option value="Mr.">Mr.</option>
                                    <option value="Ms.">Ms.</option>
                                    <option value="Mrs.">Mrs.</option>
                                </select>
                            </div>
                            <div className="space-y-2 col-span-4">
                                <Label htmlFor="first_name">First Name *</Label>
                                <Input id="first_name" name="first_name" defaultValue={speaker.first_name} required />
                            </div>
                            <div className="space-y-2 col-span-5">
                                <Label htmlFor="last_name">Last Name *</Label>
                                <Input id="last_name" name="last_name" defaultValue={speaker.last_name} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className="space-y-2 col-span-8">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input id="email" name="email" type="email" defaultValue={speaker.email} required />
                            </div>
                            <div className="space-y-2 col-span-4">
                                <Label htmlFor="display_order">Display Order</Label>
                                <Input id="display_order" name="display_order" type="number" defaultValue={speaker.display_order || 0} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="organization">Organization / Institution</Label>
                                <Input
                                    id="organization"
                                    name="organization"
                                    defaultValue={(speaker as any).organization || ''}
                                    placeholder="e.g., Mahidol University"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    defaultValue={(speaker as any).country || ''}
                                    placeholder="e.g., Thailand"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Biography</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={speaker.bio || ''}
                                placeholder="A brief professional biography..."
                                rows={5}
                                className="resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="px-8">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
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
        </div>
    );
}
