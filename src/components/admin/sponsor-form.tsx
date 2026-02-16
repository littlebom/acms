'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Camera, ArrowLeft, Globe, Phone, Building2 } from 'lucide-react';
import { type Sponsor, createSponsor, updateSponsor } from '@/app/actions/sponsors';
import { ImageCropper } from '@/components/admin/image-cropper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function SponsorForm({
    sponsor,
    mode = 'add'
}: {
    sponsor?: Sponsor,
    mode?: 'add' | 'edit'
}) {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(sponsor?.logo_url || null);
    const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        if (mode === 'edit' && sponsor) {
            formData.append('id', sponsor.id.toString());
            if (sponsor.logo_url) {
                formData.append('current_logo_url', sponsor.logo_url);
            }
        }

        // If we have a cropped image, use it instead of the original
        if (croppedImageFile) {
            formData.delete('logo');
            formData.append('logo', croppedImageFile);
        }

        const result = mode === 'add' ? await createSponsor(formData) : await updateSponsor(formData);

        setLoading(false);
        if (result.error) {
            alert(result.error);
        } else {
            router.push('/admin/engagement/sponsors');
            router.refresh();
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedImageFile(url);
            setCropperOpen(true);
        }
    };

    const handleCropComplete = async (croppedImageUrl: string) => {
        const blob = await (await fetch(croppedImageUrl)).blob();
        const file = new File([blob], 'sponsor-logo.png', { type: 'image/png' });

        setCroppedImageFile(file);
        setImagePreview(croppedImageUrl);
        setCropperOpen(false);
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Upload Section */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Sponsor Logo</CardTitle>
                        <CardDescription>Upload the company logo. Square or rectangular logos work best.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="relative w-full aspect-square bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed overflow-hidden group">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Logo preview" className="w-full h-full object-contain" />
                            ) : (
                                <Building2 className="w-12 h-12 text-slate-300" />
                            )}

                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <div className="flex flex-col items-center text-white gap-2">
                                    <Camera className="w-6 h-6" />
                                    <span className="text-sm font-medium">Change Logo</span>
                                </div>
                                <input type="file" name="logo" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-400 text-center">
                            Recommended: PNG or JPG, max 5MB.
                        </p>
                    </CardContent>
                </Card>

                {/* Main Information Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Company Details</CardTitle>
                        <CardDescription>Enter the basic profile information for this sponsor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name_en">Company Name (English) *</Label>
                            <Input id="name_en" name="name_en" defaultValue={sponsor?.name_en} placeholder="e.g. Acme Corporation" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name_th">Company Name (Thai) *</Label>
                            <Input id="name_th" name="name_th" defaultValue={sponsor?.name_th} placeholder="เช่น บริษัท แอคมี่ จำกัด" required />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="website_url">Website URL</Label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input id="website_url" name="website_url" defaultValue={sponsor?.website_url || ''} className="pl-9" placeholder="https://example.com" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contact_number">Contact Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input id="contact_number" name="contact_number" defaultValue={sponsor?.contact_number || ''} className="pl-9" placeholder="+66..." />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'add' ? 'Create Sponsor' : 'Save Changes'}
                </Button>
            </div>

            {selectedImageFile && (
                <ImageCropper
                    imageUrl={selectedImageFile}
                    open={cropperOpen}
                    onClose={() => setCropperOpen(false)}
                    onCropComplete={handleCropComplete}
                    aspectRatio={1} // Square for logos usually works well, but we can make it flexible
                    outputType="image/png"
                />
            )}
        </form>
    );
}
